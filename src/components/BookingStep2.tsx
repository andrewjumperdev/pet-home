import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import dogSmallGif from "/images/dog_small.gif";
import dogLargeGif from "/images/dog_large.gif";
import catGif from "/images/cat.gif";
import { motion } from "framer-motion";
import { Service } from "../pages/Services";


const petVariant = { idle: { y: [0, -8, 0], transition: { duration: 1.5, repeat: Infinity } } };

export default function BookingStep2({
  service,
  quantity,
  sizes, 
  details,
  setTouched,
  arrivalTime, departureTime,
  isSterilized,
  selectedRange,
  onClose
}: {
  service: Service;
  quantity: number;
  setQuantity: (q: number) => void;
  sizes: string[];
  setSizes: (s: string[]) => void;
  details: { name: string; breed: string; age: string }[];
  setDetails: (d: { name: string; breed: string; age: string }[]) => void;
  touched: boolean[];
  setTouched: (t: boolean[]) => void;
  arrivalTime: string;
  departureTime: string;
  isSterilized: string;
  setIsSterilized: (s: string) => void;
  selectedRange: [Date, Date] | null;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  // const errors = details.map((d, i) => ({
  //   name: !d.name.trim() && touched[i],
  //   breed: !d.breed.trim() && touched[i],
  //   age: !(Number(d.age) > 0) && touched[i],
  // }));
  const largeCount = sizes.filter((s) => s === "Gros chien").length;

  const getGif = (size: string) =>
    service.type === "cat"
      ? catGif
      : size === "Gros chien"
      ? dogLargeGif
      : dogSmallGif;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const hasErrors = details.some(
      (d) => !d.name.trim() || !d.breed.trim() || !(Number(d.age) > 0)
    );
    if (hasErrors || !selectedRange || largeCount > 1 || !arrivalTime || !departureTime || isSterilized === "") {
      setTouched(Array(quantity).fill(true));
      return;
    }

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
      },
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {/* Inputs para perros o gatos */}
      {/* Aquí se pueden modularizar aún más creando un componente PetInput */}

      <button type="submit" className="w-full py-3 rounded bg-blue-600 hover:bg-blue-700 text-white">
        Confirmer
      </button>
    </form>
  );
}
