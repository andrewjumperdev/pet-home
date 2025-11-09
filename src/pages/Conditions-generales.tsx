'use client';
import { useState } from "react";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="w-full flex justify-between items-center text-left font-semibold text-lg text-gray-800 hover:text-indigo-600 transition-colors duration-200"
        onClick={() => setOpen(!open)}
      >
        {title}
        <span className="ml-2 text-sm">{open ? '▲' : '▼'}</span>
      </button>
      <div
        className={`mt-2 text-gray-700 transition-all duration-300 overflow-hidden ${
          open ? "max-h-[1000px]" : "max-h-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

const ConditionsPage = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">
          Conditions Générales de Vente – Service de Garderie pour Animaux de Compagnie
        </h1>
        <p className="mb-6 text-gray-700">
          En réservant une prestation sur notre site, le client reconnaît avoir lu, compris et accepté les présentes Conditions Générales de Vente (CGV) sans réserve. Le paiement de la réservation vaut acceptation pleine et entière de ces conditions.
        </p>

        <Section title="1. Objet">
          Les présentes CGV encadrent les prestations de garde d’animaux domestiques proposées via notre plateforme. Elles définissent les droits et obligations du client (propriétaire de l’animal) et de l’intervenant (petsitter).
        </Section>

        <Section title="2. Réservation et Paiement">
          La réservation s’effectue en ligne selon les dates choisies par le client. Le tarif est fixé selon le type d’animal, la durée de garde et les options sélectionnées. Le paiement s’effectue au moment de la réservation.
        </Section>

        <Section title="3. Conditions d’accueil">
          <h4 className="font-semibold mt-2">Le client s’engage à :</h4>
          <ul className="list-disc list-inside mt-1">
            <li>Fournir un animal en bonne santé, non agressif et à jour de ses vaccins.</li>
            <li>Remettre les éléments nécessaires à la garde : nourriture, jouets, panier, litière, laisse, muselière, médicaments si besoin, etc.</li>
            <li>Signaler tout comportement particulier ou traitement médical à administrer.</li>
          </ul>
          <h4 className="font-semibold mt-2">Le petsitter s’engage à :</h4>
          <ul className="list-disc list-inside mt-1">
            <li>Veiller au bien-être de l’animal et respecter ses habitudes.</li>
            <li>Ne jamais sous-traiter la garde à un tiers.</li>
            <li>Envoyer des nouvelles quotidiennes au client pendant la garde (photos ou messages).</li>
            <li>Contacter le client en cas de problème de santé ou de comportement.</li>
          </ul>
        </Section>

        <Section title="4. Durée et horaires de garde">
          <ul className="list-disc list-inside mt-1">
            <li>Demi-journée: jusqu’à 5 heures maximum.</li>
            <li>Journée: de 5 heures à 9 heures.</li>
            <li>Au-delà de 9 heures: la garde sera facturée au tarif « nuitée » (animal dormant sur place).</li>
            <li>Si l’heure de récupération dépasse de plus de 2 heures l’heure de dépôt prévue, une demi-journée supplémentaire sera facturée, au tarif de 12€.</li>
          </ul>
        </Section>

        <Section title="5. Retard du client">
          En cas de retard de plus d’une heure par rapport à l’horaire convenu, le tarif sera ajusté automatiquement au palier supérieur.
        </Section>

        <Section title="6. Modification de la réservation">
          Toute modification doit être communiquée par écrit au moins 7 jours avant la prestation. Modifications tardives suivront les conditions d’annulation.
        </Section>

        <Section title="7. Annulation et Remboursement">
          <ul className="list-disc list-inside mt-1">
            <li>Plus de 7 jours avant: remboursement total.</li>
            <li>Entre 7 jours et 72 heures: remboursement de 50 %.</li>
            <li>Moins de 48 heures: aucun remboursement.</li>
          </ul>
          <p>L’annulation doit être communiquée par écrit (email ou SMS).</p>
        </Section>

        <Section title="8. Responsabilité">
          Le client conserve l’entière responsabilité légale de son animal pendant la garde. Le petsitter n’est pas responsable en cas de maladie, accident ou décès sans faute prouvée.
        </Section>

        <Section title="9. Urgence vétérinaire">
          En cas de besoin urgent, le petsitter peut consulter un vétérinaire sans accord préalable. Les frais sont à la charge du client, qui s’engage à rembourser sous 7 jours.
        </Section>

        <Section title="10. Refus ou interruption de la garde">
          En cas de comportement dangereux non signalé, le petsitter pourra interrompre la garde sans remboursement.
        </Section>

        <Section title="11. Force majeure">
          Maladie, catastrophe naturelle ou restrictions légales peuvent entraîner un remboursement total ou partiel ou une solution alternative.
        </Section>

        <Section title="12. Droit à l’image">
          Le client autorise le petsitter à prendre des photos ou vidéos de l’animal pour communication. Toute objection doit être signalée expressément.
        </Section>

        <Section title="13. Données personnelles">
          Les informations collectées sont utilisées uniquement pour la gestion des prestations et ne sont jamais transmises sans accord explicite.
        </Section>

        <Section title="14. Litiges">
          Les CGV sont soumises à la loi française. Les différends privilégient une solution amiable; à défaut, le litige relève des tribunaux compétents.
        </Section>

        <p className="mt-6 font-semibold text-gray-800">
          En procédant au paiement, vous acceptez sans réserve les présentes Conditions Générales de Vente.
        </p>
      </div>
    </main>
  );
};

export default ConditionsPage;
