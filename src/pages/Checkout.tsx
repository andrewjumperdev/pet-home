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
import {
  Calendar as CalendarIcon,
  Info,
  User,
  CheckCircle2,
} from "lucide-react";
import { db } from "../lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { services as allServices } from "./Services";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface ContactInfo {
  name: string;
  email: string;
}

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
  service: any;
  quantity: number;
  sizes: string[];
  details: any[];
  start: Date;
  end: Date;
  arrivalTime: string;  
  departureTime: string;
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
      const { data } = await axios.post(
        "https://api.maisonpourpets.com/create-payment-intent",
        {
          amount: total,
          client_name: contact.name,
          client_email: contact.email,      
          service: service.title,            
          quantity,                          
          sizes,                             
          details,                           
          start_date: start.toISOString(),   
          end_date: end.toISOString(),       
          arrival_time: arrivalTime,         
          departure_time: departureTime,     
          isSterilized,                      
        }
      );

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError("Erreur avec le champ carte.");
        setProcessing(false);
        return;
      }

      const paymentResult = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: contact.name,
            email: contact.email,
          },
        },
      });

      if (paymentResult.error) {
        setError(paymentResult.error.message ?? "Erreur de paiement.");
        setProcessing(false);
        return;
      }

      if (paymentResult.paymentIntent.status === "succeeded") {
        let curr = new Date(start);
        while (curr <= end) {
          await addDoc(collection(db, "bookings"), {
            serviceId: service.id,
            date: curr.toISOString().split("T")[0],
            quantity,
            sizes,
            details,
            contact,
            paymentId: paymentResult.paymentIntent.id,
            createdAt: new Date().toISOString(),
          });
          curr.setDate(curr.getDate() + 1);
        }
        onSuccess();
      }
    } catch (err) {
      setError("Erreur lors du traitement du paiement.");
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
        {processing ? "Traitement en cours..." : `Payer ${total.toFixed(2)} €`}
      </button>
    </form>
  );
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    service: serviceData,
    selectedRange,
    quantity,
    sizes,
    details,
    arrivalTime,
    departureTime,
    isSterilized,
  } = location.state || {};


    useEffect(() => {
    console.log("ArrivalTime:", arrivalTime);
    console.log("DepartureTime:", departureTime);
  }, [arrivalTime, departureTime]);

  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});
  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);

  const [datepickerRange, setDatepickerRange] = useState<Date[]>(
    selectedRange || [new Date(), new Date()]
  );

  if (!serviceData || !selectedRange) {
    return (
      <p className="text-red-600 text-center mt-20 font-semibold">
        Informations manquantes. Veuillez revenir en arrière.
      </p>
    );
  }

  const service = allServices.find((s) => s.id === serviceData.id)!;
  const [start, end] = datepickerRange;
  const days = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const rate =
    service.type === "cat" ? 15 : sizes.includes("Gros chien") ? 30 : 25;
  const total = days * rate * quantity;

  const validateContact = () => {
    const errs: { name?: string; email?: string } = {};
    if (!contact.name.trim()) errs.name = "Nom requis";
    if (!/^\S+@\S+\.\S+$/.test(contact.email)) errs.email = "Email invalide";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !validateContact()) return; // Solo valida al avanzar del paso 1
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
          order: "dummy", // reemplaza con info real si quieres
          contact,
          serviceId: service.id,
          dates: [start, end],
          bookingCount: days,
        },
      });
    }, 2200);
  };

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
              >
                <h2 className="text-3xl font-bold text-blue-700 mb-6 flex items-center gap-3">
                  <CalendarIcon size={28} /> Choisissez vos dates
                </h2>
                <Calendar
                  selectRange
                  onChange={(r) =>
                    Array.isArray(r) &&
                    r[0] instanceof Date &&
                    r[1] instanceof Date &&
                    setDatepickerRange([r[0], r[1]])
                  }
                  value={
                    Array.isArray(datepickerRange) &&
                    datepickerRange.length === 2
                      ? [datepickerRange[0], datepickerRange[1]]
                      : undefined
                  }
                  className="rounded-3xl shadow-md max-w-md mx-auto"
                />
                <p className="mt-6 text-center text-gray-700 text-lg font-semibold">
                  {start.toLocaleDateString("fr-FR")} →{" "}
                  {end.toLocaleDateString("fr-FR")} ({days} nuits)
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
                      {service.title}
                    </span>
                  </p>
                  <p>
                    <strong>Quantité :</strong> {quantity}
                  </p>
                  <p>
                    <strong>Taille :</strong> {sizes.join(", ")}
                  </p>
                  <p className="text-xl font-bold mt-4">
                    Total :{" "}
                    <span className="text-green-600">{total.toFixed(2)} €</span>
                  </p>
                </div>

                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    total={total}
                    start={start}
                    end={end}
                    service={service}
                    quantity={quantity}
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
              <strong>Dates:</strong> <br />
              {start.toLocaleDateString("fr-FR")} →{" "}
              {end.toLocaleDateString("fr-FR")}
              <br />
              <small className="text-gray-600 font-normal">
                ({days} nuits)
              </small>
            </p>
            <p>
              <strong>Heure d’arrivée :</strong> <br />
              {arrivalTime}
            </p>
            <p>
              <strong>Heure de départ :</strong> <br />
              {departureTime}
            </p>
            <p>
              <strong>Stérilisée :</strong> <br />
              {isSterilized}
            </p>
            <p>
              <strong>Service:</strong> <br />
              {service.title}
            </p>
            <p>
              <strong>Quantité:</strong> <br />
              {quantity}
            </p>
            <p>
              <strong>Taille:</strong> <br />
              {sizes.join(", ")}
            </p>
            <hr className="my-4 border-blue-300" />
            <p className="text-2xl font-bold">
              Total:{" "}
              <span className="text-green-600">{total.toFixed(2)} €</span>
            </p>
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
