import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Dog as DogIcon, Cat as CatIcon, PawPrint, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReviewsPage from './Temoignages';

// GIF imports
import dogSmallGif from '/public/images/dog_small.gif';
import dogLargeGif from '/public/images/dog_large.gif';
import catGif from '/public/images/cat.gif';

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

const services = [
  { id: 1, title: 'FORMULE FLASH', subtitle: 'Journée & Week-end', description: 'Parfait pour des escapades courtes', rates: ['Petit & moyen chien : 25€/jour', 'Gros chien : 30€/jour', 'Deux chiens : -10%'], icon: <DogIcon className="h-10 w-10 text-yellow-500" />, type: 'dog' },
  { id: 2, title: 'FORMULE SÉJOURS', subtitle: '3 jours et plus', description: 'Idéal pour des vacances idylliques', rates: ['Petit & moyen chien : 20€/jour', 'Gros chien : 25€/jour', 'Deux chiens : -10%'], icon: <PawPrint className="h-10 w-10 text-pink-500" />, type: 'dog' },
  { id: 3, title: 'FORMULE FÉLIN', subtitle: 'Garderie chats', description: 'Confort et câlins garantis', rates: ['Chat : 15€/jour', 'Deux chats : -10%'], icon: <CatIcon className="h-10 w-10 text-purple-500" />, type: 'cat' },
];

const petVariant = {
  idle: { y: [0, -8, 0], transition: { duration: 1.5, repeat: Infinity } }
};

export default function Services() {
  const [modal, setModal] = useState<typeof services[0] | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (overlayRef.current && e.target === overlayRef.current) setModal(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <section className="bg-gradient-to-br from-green-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-blue-600 mb-12">SERVICES ET TARIFS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s) => (
            <motion.div key={s.id} whileHover={{ scale: 1.04 }} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-6 flex flex-col">
              <div className="flex-1">
                <div className="flex justify-center mb-4">{s.icon}</div>
                <h3 className="text-xl font-bold uppercase text-gray-800 text-center mb-2">{s.title}</h3>
                <p className="text-sm uppercase font-semibold text-gray-500 text-center mb-4">{s.subtitle}</p>
                <p className="text-base text-gray-600 mb-4 text-center">{s.description}</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  {s.rates.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
              <button onClick={() => setModal(s)} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-2xl uppercase w-full">Réservez</button>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {modal && <BookingModal service={modal} onClose={() => setModal(null)} overlayRef={overlayRef} />}
        </AnimatePresence>

        <div className="mt-16 px-4">
          <h3 className="text-2xl font-semibold text-center text-gray-800 mb-8">Avis des clients</h3>
          <ReviewsPage />
        </div>
      </div>
    </section>
  );
}

function BookingModal({ service, onClose, overlayRef }: { service: typeof services[0]; onClose: () => void; overlayRef: React.RefObject<HTMLDivElement>; }) {
  const [quantity, setQuantity] = useState(1);
  const [sizes, setSizes] = useState<string[]>(['Petit & moyen chien']);
  const [details, setDetails] = useState<{ name: string; breed: string; age: string }[]>([
    { name: '', breed: '', age: '' }
  ]);
  const [touched, setTouched] = useState<boolean[]>([false]);

  useEffect(() => {
    const syncArr = <T,>(arr: T[], defaultVal: T) => {
      const copy = [...arr];
      if (quantity > copy.length) copy.push(defaultVal);
      else copy.splice(quantity);
      return copy;
    };
    setSizes((prev) => syncArr(prev, 'Petit & moyen chien'));
    setDetails((prev) => syncArr(prev, { name: '', breed: '', age: '' }));
    setTouched((prev) => syncArr(prev, false));
  }, [quantity]);

  const handleDetailChange = (idx: number, field: keyof typeof details[0], value: string) => {
    setDetails((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));
  };
  const handleBlur = (idx: number) => setTouched((prev) => prev.map((t, i) => (i === idx ? true : t)));

  const errors = details.map((d) => ({
    name: !d.name.trim(),
    breed: !d.breed.trim(),
    age: !(Number(d.age) > 0)
  }));
  const hasFieldError = errors.some((e) => e.name || e.breed || e.age);
  const largeCount = sizes.filter((s) => s === 'Gros chien').length;
  const isInvalid = largeCount > 1 || hasFieldError;

  const getGif = (size: string) =>
    service.type === 'cat' ? catGif : size === 'Gros chien' ? dogLargeGif : dogSmallGif;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isInvalid) return;
    // proceed to reservation logic
    console.log({ service, quantity, sizes, details });
    onClose();
  };

  return (
    <motion.div
      ref={overlayRef}
      className="fixed inset-0 bg-white bg-opacity-50 overflow-auto p-4 flex items-center justify-center z-50"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white w-full max-w-2xl rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200">
          <X className="w-6 h-6 text-gray-700" />
        </button>
        <h4 className="text-2xl font-bold mb-4 text-blue-600 text-center">
          Réservation - {service.title}
        </h4>
        <p className="text-sm text-gray-600 mb-6 text-center">
          En poursuivant, vous acceptez nos{' '}
          <a href="/cgv" className="underline text-blue-600">CGV</a>.
        </p>

        <div className="flex flex-col-reverse md:flex-row gap-8">
          <form className="flex-1 space-y-6" onSubmit={handleSubmit} noValidate>
            {service.type === 'dog' && (
              <>
                <div>
                  <label className="block text-sm font-medium">Nombre de chiens</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="mt-1 w-full border rounded p-2 text-sm"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </div>
                {sizes.map((sz, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium">Taille chien {idx + 1}</label>
                    <select
                      value={sz}
                      onChange={(e) => setSizes((prev) => prev.map((s, i) => (i === idx ? e.target.value : s)))}
                      className="mt-1 w-full border rounded p-2 text-sm"
                    >
                      <option>Petit & moyen chien</option>
                      <option>Gros chien</option>
                    </select>
                  </div>
                ))}
                {largeCount > 1 && (
                  <p className="text-red-600 text-sm">Un seul chien de grande taille autorisé.</p>
                )}
              </>
            )}

            {details.map((d, idx) => (
              <div key={idx} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium">Nom complet</label>
                  <input
                    type="text"
                    value={d.name}
                    onChange={(e) => handleDetailChange(idx, 'name', e.target.value)}
                    onBlur={() => handleBlur(idx)}
                    className={cn(
                      'mt-1 w-full border rounded p-2 text-sm',
                      errors[idx].name && touched[idx] && 'border-red-500'
                    )}
                  />
                  {errors[idx].name && touched[idx] && (
                    <p className="text-red-600 text-xs">Nom requis</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">Race</label>
                  <input
                    type="text"
                    value={d.breed}
                    onChange={(e) => handleDetailChange(idx, 'breed', e.target.value)}
                    onBlur={() => handleBlur(idx)}
                    className={cn(
                      'mt-1 w-full border rounded p-2 text-sm',
                      errors[idx].breed && touched[idx] && 'border-red-500'
                    )}
                  />
                  {errors[idx].breed && touched[idx] && (
                    <p className="text-red-600 text-xs">Race requise</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">Âge</label>
                  <input
                    type="number"
                    value={d.age}
                    onChange={(e) => handleDetailChange(idx, 'age', e.target.value)}
                    onBlur={() => handleBlur(idx)}
                    className={cn(
                      'mt-1 w-full border rounded p-2 text-sm',
                      errors[idx].age && touched[idx] && 'border-red-500'
                    )}
                  />
                  {errors[idx].age && touched[idx] && (
                    <p className="text-red-600 text-xs">Âge valide requis</p>
                  )}
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={isInvalid}
              className={cn(
                'w-full py-3 rounded-2xl uppercase text-sm font-semibold',
                isInvalid
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              )}
            >
              Confirmer
            </button>
          </form>

          <div className="flex-1 flex justify-center items-center gap-4">
            {sizes.map((sz, i) => (
              <motion.img
                key={i}
                src={getGif(sz)}
                alt={sz}
                className={cn(
                  sz === 'Gros chien' ? 'h-40 w-40' : 'h-28 w-28',
                  'object-contain'
                )}
                variants={petVariant}
                initial="idle"
                animate="idle"
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}