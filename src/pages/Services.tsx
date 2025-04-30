import React, { useState } from 'react';
import { Dog, Cat, PawPrint, X } from 'lucide-react';
import { motion } from 'framer-motion';

// Offres et formules
const couponInfo = [
  '10% sur ta 1ʳᵉ réservation',
  '15% sur ta 5ᵉ réservation',
  'Offres saisonnières',
];

const couponConditions = [
  'Valable 3 mois à compter de la 1ʳᵉ réservation',
  'Un seul coupon utilisable par réservation',
];

const services = [
  {
    id: 1,
    title: 'Formule Flash (journée & week-end)',
    subtitle: 'Parfait pour les escapades courtes',
    rates: [
      'Petit et moyens chiens : 25€/jour et par chien',
      'Gros chiens : 30€/jour et par chien',
      'Pour deux chiens : remise de 20% sur le prix total',
    ],
    guarantee: [
      '3 longues balades (45–90min, selon l’énergie)',
      '4 balades pour les grands chiens',
      'Attention exclusive (1 propriétaire à la fois)',
      'Jeux, câlins et bien-être',
      'Photos quotidiennes et communication 7j/7',
      'Liberté totale dans l’appartement',
      'Administration de médicaments si besoin',
    ],
    icon: <Dog className="h-12 w-12 text-yellow-500" />,  
  },
  {
    id: 2,
    title: 'Formule Séjours (≥ 3 jours)',
    subtitle: 'Idéal pour des vacances rêvées',
    rates: [
      'Petit et moyens chiens : 20€/jour et par chien',
      'Gros chiens : 25€/jour et par chien',
      'Pour deux chiens : remise de 10% sur le prix total',
    ],
    guarantee: [
      '3 longues balades (45–90min, selon l’énergie)',
      '4 balades pour les grands chiens',
      'Attention exclusive (1 propriétaire à la fois)',
      'Jeux, câlins et bien-être',
      'Photos quotidiennes et communication 7j/7',
      'Liberté totale dans l’appartement',
      'Administration de médicaments si besoin',
    ],
    icon: <PawPrint className="h-12 w-12 text-pink-500" />,  
  },
  {
    id: 3,
    title: 'Formule Félin (garderie chats)',
    subtitle: 'Un vrai paradis pour chat',
    rates: [
      '15€/jour et par chat',
      'Pour deux chats : remise de 10% sur le prix total',
    ],
    guarantee: [
      'Attention exclusive (1 propriétaire à la fois)',
      'Jeux, câlins et bien-être',
      'Photos quotidiennes et communication 7j/7',
      'Liberté totale dans l’appartement',
      'Administration de médicaments si besoin',
    ],
    icon: <Cat className="h-12 w-12 text-purple-500" />,  
  },
];

const Services: React.FC = () => {
  const [modalService, setModalService] = useState<typeof services[0] | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [petCount, setPetCount] = useState<number>(1);

  const resetModal = () => {
    setModalService(null);
    setStartDate('');
    setEndDate('');
    setPetCount(1);
  };

  const computeDays = () => {
    if (!startDate || !endDate) return 0;
    const msPerDay = 1000 * 60 * 60 * 24;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / msPerDay) + 1;
    return diff > 0 ? diff : 0;
  };

  const computeTotal = () => {
    if (!modalService) return 0;
    const days = computeDays();
    const base = parseInt(modalService.rates[0].match(/\d+/)?.[0] || '0');
    let total = days * base * petCount;
    if (petCount === 2) total *= (1 - (modalService.rates[2] ? parseFloat(modalService.rates[2].match(/\d+/)?.[0] || '0')/100 : 0));
    return total;
  };

  return (
    <section className="bg-blue-50 pt-20 pb-20 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-blue-600">Services et Tarifs</h2>
        <p className="text-lg md:text-xl text-gray-700">Offres et garderie pour chiens & chats</p>
      </div>

      {/* Coupons */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-8 mb-16 max-w-4xl mx-auto border-2 border-blue-200"
      >
        <h3 className="text-2xl font-bold mb-4 text-blue-600">Offres</h3>
        <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
          {couponInfo.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
        <h4 className="font-semibold mb-2 text-blue-500">Conditions d’application</h4>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          {couponConditions.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      </motion.div>

      {/* Cartes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {services.map(svc => (
          <motion.div
            key={svc.id}
            className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center hover:shadow-2xl transition-shadow duration-300"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="mb-4">{svc.icon}</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-1">{svc.title}</h3>
            <p className="text-gray-500 mb-4">{svc.subtitle}</p>
            <ul className="text-gray-600 text-sm mb-4 list-disc list-inside space-y-1 w-full">
              {svc.rates.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
            <motion.button
              onClick={() => setModalService(svc)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full"
              whileTap={{ scale: 0.9 }}
            >
              Réservez
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {modalService && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border-4 border-blue-200"
          >
            <button onClick={resetModal} className="absolute top-4 right-4"><X className="h-6 w-6 text-blue-500 hover:text-blue-700"/></button>
            <h3 className="text-2xl font-bold mb-4 text-blue-600">Réservation - {modalService.title}</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-blue-500 mb-2">Début</label>
                <motion.input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full p-2 border rounded"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              <div>
                <label className="block text-blue-500 mb-2">Fin</label>
                <motion.input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full p-2 border rounded"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-blue-500 mb-2">Nombre d’animaux (max 2)</label>
              <motion.input
                type="number" min={1} max={2}
                value={petCount}
                onChange={e => setPetCount(Math.min(2, +e.target.value || 1))}
                className="w-24 p-2 border rounded"
                whileFocus={{ scale: 1.1 }}
              />
            </div>
            <div className="text-blue-800 font-semibold mb-4">Total estimé : {computeDays()}j × x{petCount} = {computeTotal().toFixed(2)}€</div>
            <h4 className="font-semibold mb-2 text-blue-600">Nous vous garantissons :</h4>
            <ul className="list-disc list-inside text-gray-600 mb-6">
              {modalService.guarantee.map((g, i) => <li key={i}>{g}</li>)}
            </ul>
            <motion.button
              onClick={() => alert(`Réservation : ${computeTotal().toFixed(2)}€`)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              Confirmer
            </motion.button>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default Services;
