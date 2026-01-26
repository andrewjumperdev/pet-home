import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { addDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  Info,
  User,
  CheckCircle2,
  Tag,
} from "lucide-react";
import { db } from "../lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { services as allServices } from "./Services";
import { DateRange } from "react-date-range";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/* ---------------------- Types ---------------------- */
type ServiceType = "flash" | "sejour" | "felin" | string;

interface Service {
  id: ServiceType;
  type?: string;
  title?: string;
}

interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
}

/* ---------------------- CONSTANTES DE TARIFAS ---------------------- */
const PRICES = {
  // Perro
  DOG_FLASH: 20, // Jornada diurna completa
  DOG_HALF_FLASH: 10, // Media jornada (≤4h)
  DOG_NIGHT: 23, // Por noche

  // Gato
  CAT_NIGHT: 19, // Por noche
  CAT_HALF_NIGHT: 9.5, // Media noche (extra ≤6h)
};

/* ---------------------- CODES PROMO ---------------------- */
const PROMO_CODES: Record<
  string,
  { discount: number; label: string; description: string }
> = {
  BIENVENUE10: {
    discount: 0.1,
    label: "1ère réservation (-10%)",
    description: "10% de réduction sur votre première réservation",
  },
  FIDELE10: {
    discount: 0.1,
    label: "5ème réservation (-10%)",
    description: "10% de réduction pour votre fidélité",
  },
};

/* ---------------------- Types para el cálculo ---------------------- */
interface BookingCalculationParams {
  serviceId: ServiceType;
  datepickerRange: [Date, Date];
  quantity: number;
  arrivalHour?: number | null; // Hora decimal (ej: 9.5 = 09:30)
  departureHour?: number | null; // Hora decimal (ej: 17.5 = 17:30)
  sizes?: string[];
}

interface PricingBreakdown {
  nuits: number;
  flash: number;
  demiFlash: number;
  demiNuitChat: number;
  lines: { label: string; amount: number }[];
}

interface CalculationResult {
  total: number;
  days: number; // días naturales entre fechas
  nights: number; // noches base
  rate: number; // tarifa base unitaria
  message: string; // mensaje informativo
  breakdown: PricingBreakdown;
}

/* ---------------------- Util: diferencia en días ---------------------- */
function daysDifference(startDate: Date, endDate: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const sUTC = Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
  );
  const eUTC = Date.UTC(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  );
  return Math.floor((eUTC - sUTC) / msPerDay);
}

/* ---------------------- LÓGICA PRINCIPAL DE TARIFICACIÓN ---------------------- */
/**
 * Sistema de tarificación PetHome - Sin zonas grises
 *
 * REGLAS DE NEGOCIO:
 *
 * 1. FLASH vs SÉJOUR (perro):
 *    - Si NO cruza medianoche (mismo día) y salida ≤ 21:00 → FLASH
 *    - Si cruza medianoche (sale otro día) → SÉJOUR
 *    - Si salida > 21:00 → noche extra (ya es turno nocturno)
 *
 * 2. Una "noche" cubre hasta la misma hora de llegada del día de salida
 *    Ejemplo: Lun 09:00 → Vie 09:00 = 4 noches
 *
 * 3. Rubros por horas:
 *    FLASH (mismo día): ≤4h = 10€ | >4h hasta 21:00 = 20€ | >21:00 = 23€ (noche)
 *    SÉJOUR extra: ≤4h = +10€ | >4h ≤12h = +20€ | >12h = +1 noche | >21:00 = +1 noche
 *    GATO extra: ≤6h = +9.50€ | >6h o >21:00 = +1 noche
 */
export function calculateBookingTotal({
  serviceId,
  datepickerRange,
  quantity,
  arrivalHour,
  departureHour,
  sizes = [],
}: BookingCalculationParams): CalculationResult {
  const [start, end] = datepickerRange;
  const nightsBase = Math.max(0, daysDifference(start, end));
  const qty = Math.max(1, Math.floor(quantity || 1));

  const normalizedId = String(serviceId).toLowerCase();
  const isFlash = normalizedId === "1" || normalizedId === "flash";
  const isSejour = normalizedId === "2" || normalizedId === "sejour";
  const isCat =
    normalizedId === "felin" || normalizedId === "3" || normalizedId === "cat";

  // Valores por defecto si no hay horas
  const arrival = arrivalHour ?? 9; // Default: 09:00
  const departure = departureHour ?? (isFlash ? 18 : 9); // Flash: 18:00, Séjour: 09:00

  const breakdown: PricingBreakdown = {
    nuits: 0,
    flash: 0,
    demiFlash: 0,
    demiNuitChat: 0,
    lines: [],
  };

  let total = 0;
  let message = "";

  // ========== PERRO - FORMULE FLASH (mismo día, sin noche) ==========
  if (isFlash) {
    const duration = departure - arrival;

    if (departure > 21) {
      // Salida después de las 21:00 → se convierte en noche
      breakdown.nuits = 1;
      total = PRICES.DOG_NIGHT * qty;
      breakdown.lines.push({
        label: `${qty} nuit${qty > 1 ? "s" : ""} (départ après 21h)`,
        amount: total,
      });
      message = "Départ après 21h : facturé comme une nuit.";
    } else if (duration <= 4) {
      // ≤4 horas → media jornada
      breakdown.demiFlash = 1;
      total = PRICES.DOG_HALF_FLASH * qty;
      breakdown.lines.push({
        label: `${qty} demi-journée${qty > 1 ? "s" : ""} (≤4h)`,
        amount: total,
      });
      message = "Demi-journée : garde de 4 heures maximum.";
    } else {
      // >4 horas → jornada completa
      breakdown.flash = 1;
      total = PRICES.DOG_FLASH * qty;
      breakdown.lines.push({
        label: `${qty} journée${qty > 1 ? "s" : ""} complète${qty > 1 ? "s" : ""}`,
        amount: total,
      });
    }

    return {
      total: Number(total.toFixed(2)),
      days: 1,
      nights: breakdown.nuits,
      rate: isFlash ? PRICES.DOG_FLASH : PRICES.DOG_NIGHT,
      message,
      breakdown,
    };
  }

  // ========== PERRO - FORMULE SÉJOUR (1+ noches) ==========
  if (isSejour) {
    // Paso 1: Noches base
    breakdown.nuits = nightsBase;
    const nightsTotal = PRICES.DOG_NIGHT * nightsBase * qty;

    if (nightsBase > 0) {
      breakdown.lines.push({
        label: `${nightsBase} nuit${nightsBase > 1 ? "s" : ""} × ${qty} chien${qty > 1 ? "s" : ""} @ ${PRICES.DOG_NIGHT}€`,
        amount: nightsTotal,
      });
    }

    total = nightsTotal;

    // Paso 2: Calcular extra en el día de salida
    // checkout_ref = hora de llegada del día de salida
    const extraHours = departure - arrival;

    if (extraHours > 0) {
      // Prioridad 1: Salida > 21:00 → +1 noche
      if (departure > 21) {
        breakdown.nuits += 1;
        const extraNight = PRICES.DOG_NIGHT * qty;
        total += extraNight;
        breakdown.lines.push({
          label: `+1 nuit (départ après 21h)`,
          amount: extraNight,
        });
        message = "Nuit supplémentaire ajoutée : départ après 21h.";
      }
      // Prioridad 2: Extra > 12h → +1 noche
      else if (extraHours > 12) {
        breakdown.nuits += 1;
        const extraNight = PRICES.DOG_NIGHT * qty;
        total += extraNight;
        breakdown.lines.push({
          label: `+1 nuit (prolongation > 12h)`,
          amount: extraNight,
        });
        message =
          "Prolongation de plus de 12h : facturée comme nuit supplémentaire.";
      }
      // >4h ≤12h → +1 FLASH
      else if (extraHours > 4) {
        breakdown.flash = 1;
        const flashExtra = PRICES.DOG_FLASH * qty;
        total += flashExtra;
        breakdown.lines.push({
          label: `+1 journée supplémentaire (prolongation ${Math.round(extraHours)}h)`,
          amount: flashExtra,
        });
        message = "Prolongation facturée comme journée supplémentaire.";
      }
      // ≤4h → +½ FLASH
      else if (extraHours > 0) {
        breakdown.demiFlash = 1;
        const halfFlashExtra = PRICES.DOG_HALF_FLASH * qty;
        total += halfFlashExtra;
        breakdown.lines.push({
          label: `+½ journée (prolongation ${Math.round(extraHours)}h)`,
          amount: halfFlashExtra,
        });
        message = "Prolongation facturée comme demi-journée.";
      }
    }

    // Descuento 10% para 2º perro
    if (qty >= 2) {
      const discount = PRICES.DOG_NIGHT * nightsBase * 0.1;
      total -= discount;
      breakdown.lines.push({
        label: `Réduction 2ème chien (-10%)`,
        amount: -discount,
      });
    }

    return {
      total: Number(total.toFixed(2)),
      days: nightsBase + 1,
      nights: breakdown.nuits,
      rate: PRICES.DOG_NIGHT,
      message,
      breakdown,
    };
  }

  // ========== GATO - SÉJOUR (solo noches, sin Flash) ==========
  if (isCat) {
    // Noches base
    breakdown.nuits = nightsBase;
    const nightsTotal = PRICES.CAT_NIGHT * nightsBase * qty;

    if (nightsBase > 0) {
      breakdown.lines.push({
        label: `${nightsBase} nuit${nightsBase > 1 ? "s" : ""} × ${qty} chat${qty > 1 ? "s" : ""} @ ${PRICES.CAT_NIGHT}€`,
        amount: nightsTotal,
      });
    }

    total = nightsTotal;

    // Extra en el día de salida
    const extraHours = departure - arrival;

    if (extraHours > 0) {
      // >21:00 → +1 noche
      if (departure > 21) {
        breakdown.nuits += 1;
        const extraNight = PRICES.CAT_NIGHT * qty;
        total += extraNight;
        breakdown.lines.push({
          label: `+1 nuit (départ après 21h)`,
          amount: extraNight,
        });
        message = "Nuit supplémentaire : départ après 21h.";
      }
      // >6h → +1 noche
      else if (extraHours > 6) {
        breakdown.nuits += 1;
        const extraNight = PRICES.CAT_NIGHT * qty;
        total += extraNight;
        breakdown.lines.push({
          label: `+1 nuit (prolongation > 6h)`,
          amount: extraNight,
        });
        message =
          "Prolongation de plus de 6h : facturée comme nuit supplémentaire.";
      }
      // ≤6h → +½ noche
      else {
        breakdown.demiNuitChat = 1;
        const halfNight = PRICES.CAT_HALF_NIGHT * qty;
        total += halfNight;
        breakdown.lines.push({
          label: `+½ nuit (prolongation ${Math.round(extraHours)}h)`,
          amount: halfNight,
        });
        message = "Prolongation facturée comme demi-nuit.";
      }
    }

    // Redondear hacia arriba al euro más cercano para gatos
    total = Math.ceil(total);

    return {
      total: Number(total.toFixed(2)),
      days: nightsBase + 1,
      nights: breakdown.nuits,
      rate: PRICES.CAT_NIGHT,
      message,
      breakdown,
    };
  }

  // ========== FALLBACK (servicio no reconocido) ==========
  const rate = sizes.includes("Gros chien") ? 30 : PRICES.DOG_NIGHT;
  const days = Math.max(1, nightsBase + 1);
  total = rate * days * qty;

  breakdown.lines.push({
    label: `${days} jour${days > 1 ? "s" : ""} @ ${rate}€`,
    amount: total,
  });

  return {
    total: Number(total.toFixed(2)),
    days,
    nights: nightsBase,
    rate,
    message: "",
    breakdown,
  };
}

/* ---------------------- UI: Step indicator ---------------------- */
function StepIndicator({ step }: { step: number }) {
  const steps = ["Dates", "Coordonnées", "Paiement"];
  return (
    <div className="flex justify-center gap-10 mb-8 sm:mb-12 select-none">
      {steps.map((label, i) => (
        <motion.div
          key={i}
          className={`flex flex-col items-center ${
            step === i ? "text-blue-600" : "text-gray-400"
          }`}
          initial={{ scale: 0.9 }}
          animate={{ scale: step === i ? 1.15 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div
            className={`w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center border-4 ${
              step === i ? "border-blue-600 bg-blue-100" : "border-gray-300"
            } text-xl font-bold`}
          >
            {i + 1}
          </div>
          <span className="mt-2 uppercase font-semibold tracking-wide">
            {label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------------------- CheckoutForm (pago) ---------------------- */
function CheckoutForm({
  total,
  contact,
  service,
  quantity,
  sizes,
  details,
  start,
  end,
  arrivalTime,
  departureTime,
  isSterilized,
  onSuccess,
}: {
  total: number;
  contact: ContactInfo;
  service: Service;
  quantity: number;
  sizes: string[];
  details: any[];
  start: Date;
  end: Date;
  arrivalTime?: string;
  departureTime?: string;
  isSterilized: boolean;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // Crear SetupIntent para guardar el método de pago sin cobrar
      const { data } = await axios.post(
        "https://api.maisonpourpets.com/create-setup-intent",
        {
          client_name: contact.name,
          client_email: contact.email,
        },
      );

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError("Erreur avec le champ carte.");
        setProcessing(false);
        return;
      }

      // Confirmar SetupIntent para guardar el payment method
      const setupResult = await stripe.confirmCardSetup(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: contact.name,
            email: contact.email,
          },
        },
      });

      if (setupResult.error) {
        setError(
          setupResult.error.message ??
            "Erreur lors de l'enregistrement de la carte.",
        );
        setProcessing(false);
        return;
      }

      if (setupResult.setupIntent?.status === "succeeded") {
        // Guardar reserva con el payment_method_id (NO se ha cobrado aún)
        const paymentMethodId = setupResult.setupIntent
          .payment_method as string;

        let curr = new Date(start);
        const endDate = new Date(end);
        while (curr <= endDate) {
          await addDoc(collection(db, "bookings"), {
            serviceId: service.id,
            date: curr.toISOString().split("T")[0],
            quantity,
            sizes,
            details,
            contact,
            paymentMethodId: paymentMethodId, // ID del método de pago guardado
            paymentId: null, // Aún no hay pago confirmado
            paymentStatus: "pending", // Estado del pago
            createdAt: new Date().toISOString(),
            status: "pending",
            total: total,
            arrivalTime: arrivalTime || "",
            departureTime: departureTime || "",
            isSterilized: isSterilized || false,
          });
          curr.setDate(curr.getDate() + 1);
        }
        onSuccess();
      } else {
        setError("Échec de l'enregistrement du mode de paiement.");
        setProcessing(false);
      }
    } catch (err) {
      setError("Erreur lors du traitement.");
      console.error(err);
      setProcessing(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl p-8 shadow-xl max-w-md mx-auto"
      aria-live="polite"
    >
      <h3 className="text-2xl font-semibold mb-6 text-center text-blue-700">
        Rentrez vos détails de paiement
      </h3>

      <label
        htmlFor="card-element"
        className="block mb-2 font-semibold text-gray-700"
      >
        Carte de crédit
      </label>
      <div
        id="card-element"
        className="border-2 border-gray-300 rounded-lg p-4 mb-4 focus-within:ring-2 focus-within:ring-blue-500"
      >
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#1f2937",
                "::placeholder": { color: "#9ca3af" },
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                letterSpacing: "0.025em",
              },
              invalid: { color: "#dc2626" },
            },
            hidePostalCode: true,
          }}
        />
      </div>

      {error && (
        <motion.p
          initial={{ x: -10 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="text-red-600 font-semibold mb-4 text-center"
        >
          {error}
        </motion.p>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-4 rounded-lg font-bold text-white transition ${
          processing
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        aria-busy={processing}
      >
        {processing ? "Traitement en cours..." : `Confirmer la réservation`}
      </button>

      <p className="text-center text-xs text-gray-600 mt-2">
        <strong>Note:</strong> Votre carte ne sera débitée que lorsque
        l'administrateur confirmera votre réservation.
      </p>

      <p className="text-center text-sm text-gray-600 mt-4">
        En confirmant votre paiement, vous acceptez nos{" "}
        <a
          href="https://docs.google.com/document/d/e/2PACX-1vTWOtjmOqED2_IgIzI1nCXZv-G6eBlaIVaneIDZx0Ko4O1p56STTMDqUcuQs_d26JzlcNF6igfpP7_4/pub"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline font-semibold"
        >
          conditions générales
        </a>{" "}
        relatives à la prestation de garderie à domicile.
      </p>
    </form>
  );
}

/* ---------------------- Checkout principal ---------------------- */
export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    service: serviceData,
    selectedRange,
    quantity,
    sizes = [],
    details,
    arrivalTime,
    departureTime,
    isSterilized,
  } = location.state || {};

  const [contact, setContact] = useState<ContactInfo>({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});
  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);

  // Promo code state
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const applyPromoCode = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      setPromoError("Veuillez entrer un code promo");
      return;
    }
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoError(null);
      setPromoCodeInput("");
    } else {
      setPromoError("Code promo invalide");
      setAppliedPromo(null);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  const [datepickerRange, setDatepickerRange] = useState<Date[]>(
    selectedRange || [new Date(), addDays(new Date(), 1)],
  );

  if (!serviceData || !selectedRange) {
    return (
      <p className="text-red-600 text-center mt-20 font-semibold">
        Informations manquantes. Veuillez revenir en arrière.
      </p>
    );
  }

  // normalizamos service y serviceId a string para evitar errores de tipo
  const service = allServices.find(
    (s) => String(s.id) === String(serviceData.id),
  ) as Service;
  const serviceId = String(service?.id || serviceData.id) as ServiceType;

  // Forzar single-day selection para FLASH pero usando useEffect (no en render)
  useEffect(() => {
    if (serviceId === "flash") {
      const single = datepickerRange[0] || new Date();
      // Solo set si difiere (evita loop)
      if (
        !datepickerRange[0] ||
        datepickerRange[1]?.getTime() !== single.getTime() ||
        datepickerRange[0].getTime() !== single.getTime()
      ) {
        setDatepickerRange([single, single]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  // leitura segura de start/end
  const [start, end] = datepickerRange;

  // Helper parseHour (acepta "HH" o "HH:MM")
  const parseHour = (time?: string) => {
    if (!time) return null;
    const m = time.match(/^(\d{1,2})(?::(\d{2}))?$/);
    if (!m) return null;
    const h = parseInt(m[1], 10);
    const min = m[2] ? parseInt(m[2], 10) : 0;
    return h + min / 60;
  };

  const arrivalHour = parseHour(arrivalTime);
  const departureHour = parseHour(departureTime);

  // Determinar flags automáticos
  // const isHalfDay =
  //   serviceId === "flash" &&
  //   (departureHour != null && arrivalHour != null
  //     ? departureHour - arrivalHour <= 4
  //     : true);
  // const isLateDeparture =
  //   serviceId !== "flash" &&
  //   arrivalHour != null &&
  //   departureHour != null &&
  //   departureHour - arrivalHour > 2;

  // Ejecutar cálculo centralizado
  const calc = calculateBookingTotal({
    serviceId,
    datepickerRange: [start, end],
    quantity: quantity ?? 1,
    arrivalHour,
    departureHour,
    sizes,
  });

  const subtotal = calc.total;
  const days = calc.days;
  const nights = calc.nights;
  const subtleMessage = calc.message;
  const breakdown = calc.breakdown;

  // Apply promo discount if valid code
  const promoDiscount =
    appliedPromo && PROMO_CODES[appliedPromo]
      ? subtotal * PROMO_CODES[appliedPromo].discount
      : 0;
  const total = Number((subtotal - promoDiscount).toFixed(2));

  // Mensajes UI
  const flashMessage = (
    <p className="mt-4 text-sm text-gray-700 italic text-center">
      La demi-journée est limitée à 4 heures. Tout dépassement sera facturé
      comme une journée complète. Le supplément devra être réglé sur place.
    </p>
  );

  const felinSupplementMessage = (
    <p className="mt-4 text-sm text-gray-700 italic text-center">
      Un supplément de 10€ sera appliqué si le départ excède de deux heures
      l'heure d’arrivée.
    </p>
  );

  // Validación contacto
  const validateContact = () => {
    const errs: { name?: string; email?: string } = {};
    if (!contact.name?.trim()) errs.name = "Nom requis";
    if (!/^\S+@\S+\.\S+$/.test(contact.email || ""))
      errs.email = "Email invalide";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !validateContact()) return;
    setStep((s) => Math.min(s + 1, 2));
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const onPaymentSuccess = () => {
    setSuccess(true);
    setTimeout(() => {
      navigate("/success", {
        state: {
          order: "dummy",
          contact,
          serviceId,
          dates: [start, end],
          bookingCount: days,
        },
      });
    }, 1200);
  };

  const qty = Math.max(1, Math.floor(Number(quantity ?? 1)));

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8 sm:px-6 sm:px-12 max-w-5xl mx-auto mt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <StepIndicator step={step} />

      <div className="flex flex-col md:flex-row gap-10">
        <div className="flex-1 bg-white rounded-3xl shadow-xl p-10 min-h-[480px]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col"
              >
                <h2 className="text-3xl font-bold text-blue-700 mb-6 flex items-center gap-3 text">
                  <CalendarIcon size={28} /> Vos dates
                </h2>

                {serviceId === "flash" ? (
                  <>
                    <Calendar
                      onChange={(value) => {
                        if (!value) return;
                        const date = Array.isArray(value) ? value[0] : value;
                        if (date instanceof Date) {
                          setDatepickerRange([date, date]);
                        }
                      }}
                      value={datepickerRange[0]}
                      minDate={new Date()}
                      className="rounded-xl mx-auto shadow-lg"
                    />

                    {flashMessage}
                  </>
                ) : (
                  <>
                    <DateRange
                      ranges={[
                        {
                          startDate: datepickerRange?.[0] || new Date(),
                          endDate:
                            datepickerRange?.[1] || addDays(new Date(), 1),
                          key: "selection",
                        },
                      ]}
                      onChange={(item: any) => {
                        const { startDate, endDate } = item.selection;
                        if (startDate && endDate) {
                          setDatepickerRange([startDate, endDate]);
                        }
                      }}
                      minDate={new Date()}
                      rangeColors={["#2563eb"]}
                      moveRangeOnFirstSelection={false}
                      showDateDisplay={false}
                      direction="horizontal"
                      months={1}
                      className="rounded-xl mx-auto shadow-lg"
                    />
                    {serviceId === "felin" && felinSupplementMessage}
                  </>
                )}

                <p className="mt-6 text-center text-gray-700 text-lg font-semibold">
                  {datepickerRange?.[0]?.toLocaleDateString("fr-FR")} →
                  {datepickerRange?.[1]?.toLocaleDateString("fr-FR")} (
                  {Math.max(
                    1,
                    Math.round(
                      (datepickerRange?.[1]?.getTime() -
                        datepickerRange?.[0]?.getTime()) /
                        (1000 * 60 * 60 * 24),
                    ),
                  )}{" "}
                  {service.title === "FORMULE FLASH" || serviceId === "flash"
                    ? "journée"
                    : "nuit(s)"}
                  )
                </p>

                <div className="flex justify-end mt-8 max-w-md mx-auto">
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    Suivant
                  </button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-3xl font-bold text-blue-700 mb-6 flex items-center gap-3">
                  <User size={28} /> Vos coordonnées
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (validateContact()) nextStep();
                  }}
                  noValidate
                  className="max-w-md mx-auto space-y-6"
                >
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-lg font-medium text-gray-700 mb-1"
                    >
                      Nom complet
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={contact.name}
                      onChange={(e) =>
                        setContact({ ...contact, name: e.target.value })
                      }
                      className={`w-full rounded-lg border px-4 py-3 text-lg focus:outline-none focus:ring-2 ${
                        errors.name
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      aria-invalid={!!errors.name}
                      aria-describedby="name-error"
                      placeholder="Jean Dupont"
                    />
                    {errors.name && (
                      <p
                        id="name-error"
                        className="text-red-600 mt-1 font-semibold"
                      >
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-lg font-medium text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={contact.email}
                      onChange={(e) =>
                        setContact({ ...contact, email: e.target.value })
                      }
                      className={`w-full rounded-lg border px-4 py-3 text-lg focus:outline-none focus:ring-2 ${
                        errors.email
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      aria-invalid={!!errors.email}
                      aria-describedby="email-error"
                      placeholder="jean@exemple.com"
                    />
                    {errors.email && (
                      <p
                        id="email-error"
                        className="text-red-600 mt-1 font-semibold"
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-lg font-medium text-gray-700 mb-1"
                    >
                      Numéro de téléphone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={contact.phone || ""}
                      onChange={(e) =>
                        setContact({ ...contact, phone: e.target.value })
                      }
                      className={`w-full rounded-lg border px-4 py-3 text-lg focus:outline-none focus:ring-2 ${
                        errors.phone
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      aria-invalid={!!errors.phone}
                      aria-describedby="phone-error"
                      placeholder="06 12 34 56 78"
                    />
                    {errors.phone && (
                      <p
                        id="phone-error"
                        className="text-red-600 mt-1 font-semibold"
                      >
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between mt-8 max-w-md mx-auto">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 rounded-lg bg-gray-300 hover:bg-gray-400 font-semibold"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                      Suivant
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-md mx-auto"
              >
                <h2 className="text-3xl font-bold text-blue-700 mb-6 flex items-center gap-3">
                  <Info size={28} /> Paiement
                </h2>

                <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
                  <p>
                    <strong>Service :</strong>{" "}
                    <span className="text-blue-700 lowercase">
                      {service?.title}
                    </span>
                  </p>
                  <p>
                    <strong>Quantité :</strong> {qty}
                  </p>
                  <p>
                    <strong>Taille :</strong> {sizes.join(", ")}
                  </p>
                  <p className="text-xl font-bold mt-4">
                    Total :{" "}
                    <span className="text-green-600">{total.toFixed(2)} €</span>
                  </p>
                  {subtleMessage && (
                    <p className="mt-2 text-sm text-gray-600">
                      {subtleMessage}
                    </p>
                  )}
                </div>

                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    total={total}
                    start={start}
                    end={end}
                    service={service}
                    quantity={qty}
                    sizes={sizes}
                    details={details}
                    contact={contact}
                    arrivalTime={arrivalTime}
                    departureTime={departureTime}
                    isSterilized={isSterilized}
                    onSuccess={onPaymentSuccess}
                  />
                </Elements>

                <button
                  onClick={prevStep}
                  className="mt-6 w-full bg-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Retour
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed summary */}
        <motion.aside
          className="md:w-96 bg-blue-50 rounded-3xl p-8 shadow-xl text-center text-black flex flex-col items-center"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-3xl font-extrabold mb-6">Résumé</h3>
          <div className="space-y-4 text-lg font-medium">
            <p>
              <strong>Dates :</strong> <br />
              {service.title === "FORMULE FLASH" || serviceId === "flash" ? (
                // Caso FORMULE FLASH: una sola fecha
                <>
                  {start.toLocaleDateString("fr-FR")}
                  <br />
                  <small className="text-gray-600 font-normal">
                    (1 journée)
                  </small>
                </>
              ) : (
                // Caso normal: rango de fechas
                <>
                  {start.toLocaleDateString("fr-FR")} →{" "}
                  {end.toLocaleDateString("fr-FR")}
                  <br />
                  {/* <small className="text-gray-600 font-normal">
        ({days} {days > 1 ? "nuits" : "nuit"})
      </small> */}
                </>
              )}
            </p>

            <p>
              <strong>Heure d’arrivée :</strong> <br />
              {arrivalTime || "—"}
            </p>
            <p>
              <strong>Heure de départ :</strong> <br />
              {departureTime || "—"}
            </p>

            <p>
              <strong>Stérilisée :</strong> <br />
              {isSterilized ? "Oui" : "Non"}
            </p>

            <p>
              <strong>Service:</strong> <br />
              {service?.title}
            </p>

            <p>
              <strong>Quantité:</strong> <br />
              {qty}
            </p>

            <p>
              <strong>Taille:</strong> <br />
              {sizes.join(", ")}
            </p>

            <hr className="my-4 border-blue-300" />

            {/* Desglose detallado */}
            {breakdown.lines.length > 0 && (
              <div className="w-full text-left space-y-2 text-sm bg-white rounded-xl p-4 shadow-inner">
                <p className="font-bold text-gray-700 mb-2">Détail :</p>
                {breakdown.lines.map((line, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-gray-600">{line.label}</span>
                    <span
                      className={`font-semibold ${line.amount < 0 ? "text-green-600" : "text-gray-800"}`}
                    >
                      {line.amount < 0 ? " " : " = "}
                      {line.amount.toFixed(2)} €
                    </span>
                  </div>
                ))}
                {/* Promo discount line */}
                {appliedPromo && promoDiscount > 0 && (
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-green-600">
                      {PROMO_CODES[appliedPromo].label}
                    </span>
                    <span className="font-semibold text-green-600">
                      -{promoDiscount.toFixed(2)} €
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Code promo input */}
            <div className="w-full mt-4">
              <p className="font-bold text-gray-700 mb-2 text-left text-sm flex items-center gap-2">
                <Tag className="w-4 h-4" /> Code promo
              </p>
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-green-50 border-2 border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">
                      {appliedPromo}
                    </span>
                    <span className="text-green-700 text-sm">(-10%)</span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Retirer
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => {
                      setPromoCodeInput(e.target.value.toUpperCase());
                      setPromoError(null);
                    }}
                    placeholder="CODEPROMO10"
                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 uppercase"
                  />
                  <button
                    onClick={applyPromoCode}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    Appliquer
                  </button>
                </div>
              )}
              {promoError && (
                <p className="text-red-500 text-xs mt-1 text-left">
                  {promoError}
                </p>
              )}
            </div>

            {subtleMessage && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg mt-2">
                {subtleMessage}
              </p>
            )}

            <hr className="my-4 border-blue-300" />

            <p className="text-2xl font-bold">
              Total:{" "}
              <span className="text-green-600">{total.toFixed(2)} €</span>
            </p>

            {nights > 0 && (
              <p className="text-sm text-gray-500">
                ({nights} nuit{nights > 1 ? "s" : ""} au total)
              </p>
            )}
          </div>
        </motion.aside>
      </div>

      {success && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg text-center"
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
          >
            <CheckCircle2 className="mx-auto mb-4 text-green-600" size={60} />
            <h2 className="text-2xl font-bold mb-2">Paiement réussi !</h2>
            <p className="mb-6">Merci pour votre réservation.</p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
