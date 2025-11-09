import React, { useState, useEffect, useRef, FormEvent, JSX } from "react";
import { Dog as DogIcon, Cat as CatIcon, PawPrint, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReviewsPage from "../components/Temoignages";
import { useNavigate } from "react-router-dom";
import "react-calendar/dist/Calendar.css";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { addDays } from "date-fns";

import dogSmallGif from "/images/dog_small.gif";
import dogLargeGif from "/images/dog_large.gif";
import catGif from "/images/cat.gif";
import CustomButton from "../components/CustomButton";
import { Helmet } from "react-helmet";
import ReviewForm from "../components/ReviewForm";
import AnimatedOfferBanner from "../components/AnimatedOfferBanner";

export interface Service {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  rates?: string[];
  price?: number;
  icon: JSX.Element;
  type: "dog" | "cat" | "flash";
}

export const services: Service[] = [
  {
    id: "flash",
    title: "FORMULE FLASH",
    subtitle: "Journée",
    description: "Parfait pour des escapades courtes",
    rates: ["20€/jour (4h à 9h)", "12€ la demi-journée (1h à 4h)", "2 chiens: -10% sur le 2ème"],
    icon: <DogIcon className="h-10 w-10 text-yellow-500" />,
    type: "dog",
  },
  {
    id: "sejour",
    title: "FORMULE SÉJOUR",
    subtitle: "1 nuit et plus",
    description: "Idéal pour les vacances",
    rates: ["23€/nuit (jusqu’à 40kg max)", "2 chiens: -15% sur le 2ème chien"],
    icon: <PawPrint className="h-10 w-10 text-pink-500" />,
    type: "dog",
  },
  {
    id: "feline",
    title: "FORMULE FÉLIN",
    subtitle: "Journée ou nuit",
    description: "Confort et câlins garantis",
    rates: ["19€/nuit", "2 chats: -10% sur le 2ème chat"],
    icon: <CatIcon className="h-10 w-10 text-purple-500" />,
    type: "cat",
  },
];

const petVariant = {
  idle: { y: [0, -8, 0], transition: { duration: 1.5, repeat: Infinity } },
};

export default function Services() {
  const [modal, setModal] = useState<Service | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "";
  }, [modal]);

  return (
    <section className="bg-gradient-to-br from-green-50 to-white py-12 px-4 mt-16">
      <Helmet>
        <title>Nos services - PetHome</title>
        <meta
          name="description"
          content="Découvrez nos services de garde d'animaux, nos tarifs et notre engagement envers le bien-être de vos compagnons."
        />
        <meta property="og:title" content="Nos services - PetHome" />
        <meta
          property="og:description"
          content="Découvrez nos services de garde d'animaux, nos tarifs et notre engagement envers le bien-être de vos compagnons."
        />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-blue-500 mb-12">
          SERVICES ET TARIFS
        </h2>
        <AnimatedOfferBanner />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <motion.article
              key={service.id}
              whileHover={{ scale: 1.04 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-6 flex flex-col justify-between"
              role="region"
              aria-labelledby={`service-${service.id}`}
            >
              <div className="mb-6">
                <div className="flex justify-center mb-4">{service.icon}</div>
                <h3
                  id={`service-${service.id}`}
                  className="text-xl font-bold uppercase text-gray-800 text-center mb-2"
                >
                  {service.title}
                </h3>
                <p className="text-sm uppercase font-semibold text-gray-500 text-center mb-4">
                  {service.subtitle}
                </p>
                <p className="text-base text-gray-600 mb-4 text-center">
                  {service.description}
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                {(service.rates || []).map((rate, i) => (
                  <i key={i}>{rate}</i>
                ))}
                </ul>
              </div>
              <CustomButton
                label="Réservez"
                alt="Réserver ce service"
                variant="primary"
                onClick={() => setModal(service)}
              />
            </motion.article>
          ))}
        </div>
        <AnimatePresence>
          {modal && (
            <BookingModal
              service={modal}
              onClose={() => setModal(null)}
              overlayRef={overlayRef}
            />
          )}
        </AnimatePresence>
        <div className="mt-16">
          <h3 className="text-2xl font-semibold text-center text-gray-800 mb-8">
            Ils nous ont fait confiance
          </h3>
          <ReviewsPage />
          <div className="mt-12" id="avis">
            <ReviewForm />
          </div>
        </div>
      </div>
    </section>
  );
}

const timeOptions = Array.from({ length: 13 * 2 }, (_, i) => {
  const hour = 9 + Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

function BookingModal({
  service,
  onClose,
  overlayRef,
}: {
  service: Service;
  onClose: () => void;
  overlayRef: React.RefObject<HTMLDivElement | null>;
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [selectedRange, setSelectedRange] = useState<[Date, Date] | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [sizes, setSizes] = useState<string[]>(["Petit & moyen chien"]);
  const [details, setDetails] = useState<
    { name: string; breed: string; age: string }[]
  >([{ name: "", breed: "", age: "" }]);
  const [touched, setTouched] = useState<boolean[]>([false]);
  const [arrivalTime, setArrivalTime] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [isSterilized, setIsSterilized] = useState<string>("");

  useEffect(() => {
    async function fetchBooked() {
      setLoadingDates(true);
      const q = query(
        collection(db, "bookings"),
        where("serviceId", "==", service.id)
      );
      const snapshot = await getDocs(q);
      setBookedDates(snapshot.docs.map((doc) => doc.data().date as string));
      console.log(bookedDates);
      setLoadingDates(false);
    }
    fetchBooked();
  }, [service.id]);

  useEffect(() => {
    const syncArr = <T,>(arr: T[], defaultVal: T) => {
      const copy = [...arr];
      if (quantity > copy.length) copy.push(defaultVal);
      else copy.splice(quantity);
      return copy;
    };
    setSizes((prev) => syncArr(prev, "Petit & moyen chien"));
    setDetails((prev) => syncArr(prev, { name: "", breed: "", age: "" }));
    setTouched((prev) => syncArr(prev, false));
  }, [quantity]);

  const errors = details.map((d, i) => ({
    name: !d.name.trim() && touched[i],
    breed: !d.breed.trim() && touched[i],
    age: !(Number(d.age) > 0) && touched[i],
  }));
  const largeCount = sizes.filter((s) => s === "Gros chien").length;
  // const isInvalid = errors.some(e => e.name || e.breed || e.age) || largeCount > 1;
  const getGif = (size: string) =>
    service.type === "cat"
      ? catGif
      : size === "Gros chien"
      ? dogLargeGif
      : dogSmallGif;
  const { icon, ...serviceSerializable } = service;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const hasErrors = details.some(
      (d) => !d.name.trim() || !d.breed.trim() || !(Number(d.age) > 0)
    );
    if (
      hasErrors ||
      !selectedRange ||
      largeCount > 1 ||
      !arrivalTime ||
      !departureTime ||
      isSterilized === ""
    ) {
      setTouched(Array(quantity).fill(true));
      return;
    }

    navigate("/checkout", {
      state: {
        service: serviceSerializable,
        selectedRange,
        quantity,
        sizes,
        details,
        arrivalTime,
        departureTime,
        isSterilized,
      },
    });
    onClose();
  };

  const needsExtraCharge = () => {
    if (!arrivalTime || !departureTime) return false;
    const [ah, am] = arrivalTime.split(":").map(Number);
    const [dh, dm] = departureTime.split(":").map(Number);
    const totalArrival = ah * 60 + am;
    const totalDeparture = dh * 60 + dm;
    return totalDeparture - totalArrival > 120;
  };

  return (
    <motion.div
      ref={overlayRef}
      className="fixed inset-0 bg-blue-200 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white w-full max-w-lg mx-4 sm:mx-0 rounded-2xl p-8 shadow-xl max-h-[90vh] overflow-y-auto relative"
        role="dialog"
        aria-modal="true"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          aria-label="Fermer"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>
        <h4 className="text-2xl font-bold mb-4 text-blue-500 text-center">
          Réservation - {service.title}
        </h4>
        {step === 1 ? (
          <div className="bg-white p-6 max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">
              Sélectionnez vos dates
            </h2>

            {loadingDates ? (
              <p className="text-gray-600">Chargement...</p>
            ) : (
              <DateRange
                ranges={[
                  {
                    startDate: selectedRange?.[0] || new Date(),
                    endDate:
                      service.title === "FORMULE FLASH"
                        ? selectedRange?.[0] || new Date()
                        : selectedRange?.[1] || addDays(new Date(), 1),
                    key: "selection",
                  },
                ]}
                onChange={(item) => {
                  let { startDate, endDate } = item.selection;

                  if (service.title === "FORMULE FLASH") {
                    // Solo permite 1 día: forzamos que la fecha de fin sea igual a la de inicio
                    endDate = startDate;
                  }

                  if (startDate && endDate) {
                    setSelectedRange([startDate, endDate]);
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
            )}

            {selectedRange && service.title !== "FORMULE FLASH" && (
              <p className="text-sm text-gray-500 mt-2">
                {Math.round(
                  (selectedRange[1].getTime() - selectedRange[0].getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                nuits
              </p>
            )}


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure d’arrivée
                </label>
                <select
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="w-full border-gray-300 rounded-lg p-3 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Sélectionner --</option>
                  {timeOptions.map((time) => (
                    <option key={`arrival-${time}`} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure de départ
                </label>
                <select
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full border-gray-300 rounded-lg p-3 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Sélectionner --</option>
                  {timeOptions.map((time) => (
                    <option key={`departure-${time}`} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {needsExtraCharge() && (
              <p className="text-red-600 text-sm mt-3 font-medium">
                Un supplément de <strong>12€</strong> sera appliqué si le départ
                excède de deux heures l'heure d’arrivée.
              </p>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!selectedRange || !arrivalTime || !departureTime}
              className="mt-6 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {sizes.map((sz, idx) => (
                <motion.img
                  key={idx}
                  src={getGif(sz)}
                  alt={sz}
                  className={sz === "Gros chien" ? "h-40 w-40" : "h-28 w-28"}
                  variants={petVariant}
                  initial="idle"
                  animate="idle"
                />
              ))}
            </div>
            {service.type === "dog" ? (
              <>
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Nombre de chiens
                  </label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full rounded-lg border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                  >
                    {[1, 2, 3].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>

                {sizes.map((sz, i) => (
                  <div key={i} className="mb-6">
                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                      Taille chien {i + 1}
                    </label>
                    <select
                      value={sz}
                      onChange={(e) =>
                        setSizes((prev) =>
                          prev.map((s, idx) => (idx === i ? e.target.value : s))
                        )
                      }
                      className="w-full rounded-lg border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                    >
                      <option value="Petit & moyen chien">
                        Petit & moyen chien
                      </option>
                      <option value="Gros chien">Gros chien</option>
                    </select>
                    {i === 1 && largeCount > 1 && (
                      <p className="text-red-600 text-sm mt-1">
                        Un seul gros autorisé
                      </p>
                    )}
                  </div>
                ))}

                <div className="mb-6">
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Castré / Stérilisé
                  </label>
                  <select
                    value={isSterilized}
                    onChange={(e) => setIsSterilized(e.target.value)}
                    className="w-full rounded-lg border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                  >
                    <option value="">Sélectionner</option>
                    <option value="oui">Oui</option>
                    <option value="non">Non</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Nombre de chats
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                </select>
              </div>
            )}
            {details.map((d, i) => (
              <div key={i} className="mb-4 space-y-2">
                <div>
                  <label className="block text-sm font-medium">Nom</label>
                  <input
                    type="text"
                    value={d.name}
                    onChange={(e) =>
                      setDetails((prev) =>
                        prev.map((x, idx) =>
                          idx === i ? { ...x, name: e.target.value } : x
                        )
                      )
                    }
                    onBlur={() =>
                      setTouched((prev) =>
                        prev.map((t, idx) => (idx === i ? true : t))
                      )
                    }
                    className={`mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      errors[i].name && touched[i] ? "border-red-500" : ""
                    }`}
                  />
                  {errors[i].name && touched[i] && (
                    <p className="text-red-600 text-xs">Nom requis</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">Race</label>
                  <input
                    type="text"
                    value={d.breed}
                    onChange={(e) =>
                      setDetails((prev) =>
                        prev.map((x, idx) =>
                          idx === i ? { ...x, breed: e.target.value } : x
                        )
                      )
                    }
                    onBlur={() =>
                      setTouched((prev) =>
                        prev.map((t, idx) => (idx === i ? true : t))
                      )
                    }
                    className={`mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      errors[i].breed && touched[i] ? "border-red-500" : ""
                    }`}
                  />
                  {errors[i].breed && touched[i] && (
                    <p className="text-red-600 text-xs">Race requise</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">Âge</label>
                  <input
                    type="number"
                    value={d.age}
                    onChange={(e) =>
                      setDetails((prev) =>
                        prev.map((x, idx) =>
                          idx === i ? { ...x, age: e.target.value } : x
                        )
                      )
                    }
                    onBlur={() =>
                      setTouched((prev) =>
                        prev.map((t, idx) => (idx === i ? true : t))
                      )
                    }
                    className={`mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      errors[i].age && touched[i] ? "border-red-500" : ""
                    }`}
                  />
                  {errors[i].age && touched[i] && (
                    <p className="text-red-600 text-xs">Âge valide requis</p>
                  )}
                </div>
              </div>
            ))}
            <button
              type="submit"
              className="w-full py-3 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              Confirmer
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
