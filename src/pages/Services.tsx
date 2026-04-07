import React, { useState, useEffect, useRef, JSX } from "react";
import { Dog as DogIcon, Cat as CatIcon, PawPrint, X, Camera, ChevronRight, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReviewsPage from "../components/Temoignages";
import { useNavigate } from "react-router-dom";
import "react-calendar/dist/Calendar.css";
import { storage } from "../lib/firebase.tsx";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { addDays } from "date-fns";
import axios from "axios";

import CustomButton from "../components/CustomButton";
import { Helmet } from "react-helmet";
import AnimatedOfferBanner from "../components/AnimatedOfferBanner";

const API = import.meta.env.VITE_API_URL || "https://api.maisonpourpets.com";

interface PetProfile {
  id: string;
  name: string;
  breed: string;
  age: number;
  size: string;
  type: string;
  photoUrl?: string;
  isSterilized?: boolean;
}

interface ClientProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  pets: PetProfile[];
  bookingsCount: number;
}

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
    rates: ["20€/jour · 15€/demi-journée (≤4h)", "- 10% pour le 2ème chien"],
    icon: <DogIcon className="h-10 w-10 text-yellow-500" />,
    type: "dog",
  },
  {
    id: "sejour",
    title: "FORMULE SÉJOUR",
    subtitle: "1 nuit et plus",
    description: "Idéal pour les vacances",
    rates: ["23€/nuit (jusqu'à 40kg max)", "- 10% pour le 2ème chien"],
    icon: <PawPrint className="h-10 w-10 text-pink-500" />,
    type: "dog",
  },
  {
    id: "feline",
    title: "FORMULE FÉLIN",
    subtitle: "Journée ou nuit",
    description: "Confort et câlins garantis",
    rates: ["19€/nuit", "- 10% pour le 2ème"],
    icon: <CatIcon className="h-10 w-10 text-purple-500" />,
    type: "cat",
  },
];


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
                  <li key={i}>{rate}</li>
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
        <p className="mt-4 italic text-sm">*LOVE4PET applicable seulement pour la formule séjour</p>
        <div className="mt-16">
          <h3 className="text-2xl font-semibold text-center text-gray-800 mb-8">
            Ils nous ont fait confiance
          </h3>
          <ReviewsPage />
        </div>
      </div>
    </section>
  );
}

const timeOptions = Array.from({ length: 14 * 2 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

const departureTimeOptions = Array.from({ length: 31 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

// ─── Step indicator ──────────────────────────────────────────────────────────
function ModalStepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === step ? "w-8 bg-blue-600" : i < step ? "w-4 bg-blue-300" : "w-4 bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Pet photo avatar ─────────────────────────────────────────────────────────
function PetAvatar({ photoUrl, size = "lg" }: { photoUrl?: string; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "w-24 h-24 text-5xl" : "w-14 h-14 text-3xl";
  return (
    <div className={`${cls} rounded-full overflow-hidden bg-blue-50 border-2 border-blue-100 flex items-center justify-center flex-shrink-0`}>
      {photoUrl ? (
        <img src={photoUrl} alt="animal" className="w-full h-full object-cover" />
      ) : (
        <span>🐾</span>
      )}
    </div>
  );
}

// ─── BookingModal ─────────────────────────────────────────────────────────────
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
  const TOTAL_STEPS = 4;

  // ── Step 0: email identification ─────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);

  // ── Step 1: pet selection / creation ─────────────────────────────────────
  const [selectedPet, setSelectedPet] = useState<PetProfile | null>(null);
  const [isNewPet, setIsNewPet] = useState(false);
  const [petForm, setPetForm] = useState({ name: "", breed: "", age: "", size: "Petit & moyen chien" });
  const [petFormTouched, setPetFormTouched] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState("");
  const [, setPhotoUploading] = useState(false);
  // Optional 2nd pet
  const [secondPet, setSecondPet] = useState<{ name: string; breed: string; age: string; size: string } | null>(null);

  // ── Step 2: dates + times ─────────────────────────────────────────────────
  const [selectedRange, setSelectedRange] = useState<[Date, Date] | null>(null);
  const [arrivalTime, setArrivalTime] = useState("");
  const [departureTime, setDepartureTime] = useState("");

  // ── Step 3: confirmation ──────────────────────────────────────────────────
  const [isSterilized, setIsSterilized] = useState("");
  const [acceptCGV, setAcceptCGV] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleEmailSubmit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/\S+@\S+\.\S+/.test(trimmed)) {
      setEmailError("Veuillez entrer un email valide");
      return;
    }
    setEmailError("");
    setEmailLoading(true);
    try {
      const res = await axios.get(`${API}/api/clients/lookup?email=${encodeURIComponent(trimmed)}`);
      setClientProfile(res.data.found ? res.data.client : null);
    } catch {
      setClientProfile(null);
    } finally {
      setEmailLoading(false);
      setStep(1);
    }
  };

  const handleSelectExistingPet = (pet: PetProfile) => {
    setSelectedPet(pet);
    setIsNewPet(false);
    setStep(2);
  };

  const handleNewPetNext = () => {
    setPetFormTouched(true);
    if (!petForm.name.trim() || !petForm.breed.trim() || !(Number(petForm.age) > 0)) return;
    setIsNewPet(true);
    setSelectedPet(null);
    setStep(2);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setUploadedPhotoUrl("");
    setPhotoUploading(true);
    try {
      const sRef = storageRef(storage, `pets/${email.trim().toLowerCase() || "new"}/${Date.now()}`);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      setUploadedPhotoUrl(url);
    } catch (err) {
      console.warn("[Photo] pre-upload failed, will continue without photo:", err);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (service.id !== "feline" && isSterilized === "") return;
    if (!acceptCGV) return;
    if (!selectedRange || !arrivalTime || !departureTime) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      // Photo already uploaded on selection — use the pre-uploaded URL
      const photoUrl = isNewPet ? uploadedPhotoUrl : "";

      // Build primary pet
      const activePet: PetProfile = selectedPet ?? {
        id: `pet_${Date.now()}`,
        name: petForm.name.trim(),
        breed: petForm.breed.trim(),
        age: Number(petForm.age),
        size: petForm.size,
        type: service.type,
        photoUrl,
      };

      // Build quantity + arrays
      const allPets = secondPet
        ? [activePet, { ...secondPet, id: `pet_${Date.now() + 1}`, type: service.type, photoUrl: "" }]
        : [activePet];

      const quantity = allPets.length;
      const sizes = allPets.map((p) => p.size || "Petit & moyen chien");
      const details = allPets.map((p) => ({ name: p.name, breed: p.breed, age: String(p.age) }));

      const { icon, ...serviceSerializable } = service;

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
          clientEmail: email.trim().toLowerCase(),
          clientName: clientProfile?.name || "",
          clientPhone: clientProfile?.phone || "",
          selectedPet: activePet,
        },
      });
      onClose();
    } catch (err) {
      console.error("[BookingModal] submit error:", err);
      setSubmitError("Une erreur est survenue. Veuillez réessayer.");
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div
      ref={overlayRef}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto relative"
        role="dialog"
        aria-modal="true"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 pt-5 pb-4 z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <h4 className="text-xl font-bold text-blue-600 pr-8">
            Réservation — {service.title}
          </h4>
          <ModalStepBar step={step} total={TOTAL_STEPS} />
        </div>

        <div className="px-6 py-5">
          <AnimatePresence mode="wait">

            {/* ── STEP 0: Email ─────────────────────────────────────── */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-gray-500 text-sm mb-6">
                  Entrez votre email pour retrouver votre profil ou créer un compte.
                </p>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                  placeholder="marie@example.com"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${emailError ? "border-red-400" : "border-gray-300"}`}
                  autoFocus
                />
                {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                <button
                  onClick={handleEmailSubmit}
                  disabled={emailLoading || !email}
                  className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {emailLoading ? "Recherche…" : <>Continuer <ChevronRight className="w-4 h-4" /></>}
                </button>
              </motion.div>
            )}

            {/* ── STEP 1: Pet ───────────────────────────────────────── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {clientProfile && !isNewPet ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">👋</span>
                      <h3 className="text-lg font-bold text-gray-800">Bonjour, {clientProfile.name} !</h3>
                    </div>
                    <p className="text-gray-500 text-sm mb-5">Quel compagnon souhaitez-vous confier ?</p>

                    {clientProfile.pets.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {clientProfile.pets.map((pet) => (
                          <button
                            key={pet.id}
                            onClick={() => handleSelectExistingPet(pet)}
                            className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl transition text-left"
                          >
                            <PetAvatar photoUrl={pet.photoUrl} size="sm" />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{pet.name}</p>
                              <p className="text-sm text-gray-500">{pet.breed} · {pet.age} an{pet.age > 1 ? "s" : ""} · {pet.size}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => setIsNewPet(true)}
                      className="w-full border-2 border-dashed border-blue-300 text-blue-600 font-semibold py-3 rounded-xl hover:bg-blue-50 transition text-sm"
                    >
                      + Ajouter un nouveau compagnon
                    </button>
                  </>
                ) : (
                  <>
                    {clientProfile && (
                      <button onClick={() => setIsNewPet(false)} className="text-blue-500 text-sm mb-4 flex items-center gap-1 hover:underline">
                        ← Retour à mes animaux
                      </button>
                    )}
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      {service.type === "cat" ? "🐱 Votre chat" : "🐶 Votre chien"}
                    </h3>

                    {/* Photo upload */}
                    <div className="flex flex-col items-center mb-5">
                      <div
                        className="w-24 h-24 rounded-full overflow-hidden bg-blue-50 border-2 border-dashed border-blue-300 flex items-center justify-center cursor-pointer hover:border-blue-500 transition"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {photoPreview ? (
                          <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center text-blue-400">
                            <span className="text-3xl">🐾</span>
                            <Camera className="w-4 h-4 mt-1" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Photo facultative</p>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </div>

                    {/* Pet form */}
                    <div className="space-y-3">
                      {[
                        { label: "Nom *", key: "name", type: "text", placeholder: "Rocky" },
                        { label: "Race *", key: "breed", type: "text", placeholder: "Labrador" },
                        { label: "Âge (ans) *", key: "age", type: "number", placeholder: "3" },
                      ].map(({ label, key, type, placeholder }) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                          <input
                            type={type}
                            value={petForm[key as keyof typeof petForm]}
                            onChange={(e) => setPetForm((p) => ({ ...p, [key]: e.target.value }))}
                            placeholder={placeholder}
                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              petFormTouched && !petForm[key as keyof typeof petForm].trim() && key !== "age"
                                ? "border-red-400"
                                : petFormTouched && key === "age" && !(Number(petForm.age) > 0)
                                ? "border-red-400"
                                : "border-gray-300"
                            }`}
                          />
                        </div>
                      ))}
                      {service.type === "dog" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Taille</label>
                          <select
                            value={petForm.size}
                            onChange={(e) => setPetForm((p) => ({ ...p, size: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Petit & moyen chien">Petit & moyen (≤ 25kg)</option>
                            <option value="Gros chien">Grand chien (25kg+)</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* 2nd pet toggle (dogs only) */}
                    {service.type === "dog" && (
                      <div className="mt-4">
                        {!secondPet ? (
                          <button
                            type="button"
                            onClick={() => setSecondPet({ name: "", breed: "", age: "", size: "Petit & moyen chien" })}
                            className="text-blue-500 text-sm hover:underline"
                          >
                            + Ajouter un 2ème chien (-10%)
                          </button>
                        ) : (
                          <div className="border border-blue-200 rounded-xl p-3 bg-blue-50 mt-2">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-sm font-semibold text-blue-700">2ème chien (-10%)</p>
                              <button onClick={() => setSecondPet(null)} className="text-gray-400 hover:text-red-500 transition">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="space-y-2">
                              {[
                                { label: "Nom", key: "name", type: "text" },
                                { label: "Race", key: "breed", type: "text" },
                                { label: "Âge", key: "age", type: "number" },
                              ].map(({ label, key, type }) => (
                                <input
                                  key={key}
                                  type={type}
                                  placeholder={label}
                                  value={secondPet[key as keyof typeof secondPet]}
                                  onChange={(e) => setSecondPet((p) => p ? { ...p, [key]: e.target.value } : null)}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              ))}
                              <select
                                value={secondPet.size}
                                onChange={(e) => setSecondPet((p) => p ? { ...p, size: e.target.value } : null)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="Petit & moyen chien">Petit & moyen (≤ 25kg)</option>
                                <option value="Gros chien">Grand chien (&gt; 25kg)</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={handleNewPetNext}
                      className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
                    >
                      Continuer <ChevronRight className="inline w-4 h-4 ml-1" />
                    </button>
                  </>
                )}
              </motion.div>
            )}

            {/* ── STEP 2: Dates ─────────────────────────────────────── */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-lg font-bold text-gray-800 mb-4">📅 Choisissez vos dates</h3>
                <DateRange
                  ranges={[{
                    startDate: selectedRange?.[0] || new Date(),
                    endDate: service.id === "flash" ? (selectedRange?.[0] || new Date()) : (selectedRange?.[1] || addDays(new Date(), 1)),
                    key: "selection",
                  }]}
                  onChange={(item) => {
                    let { startDate, endDate } = item.selection;
                    if (service.id === "flash") endDate = startDate;
                    if (startDate && endDate) setSelectedRange([startDate, endDate]);
                  }}
                  minDate={new Date()}
                  rangeColors={["#2563eb"]}
                  moveRangeOnFirstSelection={false}
                  showDateDisplay={false}
                  direction="horizontal"
                  months={1}
                  className="rounded-xl mx-auto shadow-sm"
                />

                {selectedRange && service.id !== "flash" && (
                  <p className="text-sm text-center text-gray-500 mt-1">
                    {Math.round((selectedRange[1].getTime() - selectedRange[0].getTime()) / 86400000)} nuit(s)
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    { label: "Heure d’arrivée", value: arrivalTime, set: setArrivalTime, prefix: "arr" },
                    { label: "Heure de départ", value: departureTime, set: setDepartureTime, prefix: "dep" },
                  ].map(({ label, value, set, prefix }) => (
                    <div key={prefix}>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                      <select
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Heure --</option>
                        {(prefix === "dep" ? departureTimeOptions : timeOptions).map((t) => <option key={`${prefix}-${t}`} value={t}>{t}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedRange || !arrivalTime || !departureTime}
                  className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
                >
                  Continuer <ChevronRight className="inline w-4 h-4 ml-1" />
                </button>
                <button onClick={() => setStep(1)} className="mt-2 w-full text-gray-500 text-sm hover:underline">← Retour</button>
              </motion.div>
            )}

            {/* ── STEP 3: Confirmation ──────────────────────────────── */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-lg font-bold text-gray-800 mb-4">✅ Confirmation</h3>

                {/* Summary card */}
                <div className="bg-blue-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <PetAvatar photoUrl={selectedPet?.photoUrl || photoPreview} size="sm" />
                    <div>
                      <p className="font-semibold">{selectedPet?.name || petForm.name}</p>
                      <p className="text-gray-500">{selectedPet?.breed || petForm.breed} · {selectedPet?.age || petForm.age} an(s)</p>
                      {secondPet && <p className="text-blue-600 text-xs">+ {secondPet.name} (2ème chien -10%)</p>}
                    </div>
                  </div>
                  <p className="text-gray-600">📅 {selectedRange?.[0]?.toLocaleDateString("fr-FR")} → {selectedRange?.[1]?.toLocaleDateString("fr-FR")}</p>
                  <p className="text-gray-600">⏰ {arrivalTime} → {departureTime}</p>
                </div>

                {/* Stérilisé (dogs only) */}
                {service.type === "dog" && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Castré / Stérilisé(e) *</label>
                    <div className="flex gap-3">
                      {["oui", "non"].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setIsSterilized(val)}
                          className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition ${
                            isSterilized === val
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 text-gray-600 hover:border-blue-300"
                          }`}
                        >
                          {val === "oui" ? "Oui" : "Non"}
                        </button>
                      ))}
                    </div>
                    {service.id !== "feline" && isSterilized === "" && (
                      <p className="text-red-500 text-xs mt-1">Veuillez sélectionner une option</p>
                    )}
                  </div>
                )}

                {/* CGV */}
                <label className="flex items-start gap-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={acceptCGV}
                    onChange={(e) => setAcceptCGV(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    J’accepte les{" "}
                    <a
                      href="https://docs.google.com/document/d/e/2PACX-1vTWOtjmOqED2_IgIzI1nCXZv-G6eBlaIVaneIDZx0Ko4O1p56STTMDqUcuQs_d26JzlcNF6igfpP7_4/pub"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Conditions Générales de Vente
                    </a>{" "}
                    *
                  </span>
                </label>

                {submitError && <p className="text-red-500 text-sm mb-3 bg-red-50 rounded-lg p-2">{submitError}</p>}

                <button
                  onClick={handleFinalSubmit}
                  disabled={submitting || !acceptCGV || (service.id !== "feline" && isSterilized === "")}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="animate-pulse">Préparation…</span>
                  ) : (
                    <><CheckCircle className="w-5 h-5" /> Réserver maintenant</>
                  )}
                </button>
                <button onClick={() => setStep(2)} className="mt-2 w-full text-gray-500 text-sm hover:underline">← Retour</button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
