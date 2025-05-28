import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';

interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  dogName: string;
  dogBreed: string;
  service: string;
  message: string;
  newsletter: boolean;
}

const services = [
  'Garderie Journalière',
  'Pension de Nuit',
  'Promenade Individuelle',
  'Toilettage',
];

const ContactPage: React.FC = () => {
  const [values, setValues] = React.useState<ContactFormValues>({
    name: '',
    email: '',
    phone: '',
    dogName: '',
    dogBreed: '',
    service: services[0],
    message: '',
    newsletter: false,
  });

  const handleChange = (field: keyof ContactFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = 
      e.currentTarget.type === 'checkbox'
        ? (e.currentTarget as HTMLInputElement).checked
        : e.currentTarget.value;
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: intégration API / validation + retours UI
    console.log('Envoi du formulaire:', values);
    // afficher message de succès / erreur
  };

  return (
    <div className="container mx-auto px-4 py-12 mt-20">
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Infos et localisation */}
        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Contactez-nous</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-2">
              <MapPin />
              <p>123 Rue des Chiens Heureux, 75001 Paris, France</p>
            </div>
            <div className="flex items-center space-x-2">
              <Phone />
              <p>+33 1 23 45 67 89</p>
            </div>
            <div className="flex items-center space-x-2">
              <Mail />
              <p>contact@dogdaycare.fr</p>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire de contact */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold">Parlez-nous de votre compagnon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              placeholder="Votre nom"
              value={values.name}
              onChange={handleChange('name')}
              required
            />
            <Input
              type="email"
              placeholder="Votre e-mail"
              value={values.email}
              onChange={handleChange('email')}
              required
            />
            <Input
              type="tel"
              placeholder="Votre téléphone"
              value={values.phone}
              onChange={handleChange('phone')}
              required
            />
            <Input
              placeholder="Nom du chien"
              value={values.dogName}
              onChange={handleChange('dogName')}
              required
            />
            <Input
              placeholder="Race du chien"
              value={values.dogBreed}
              onChange={handleChange('dogBreed')}
              required
            />
            <select
              className="w-full p-2 rounded-lg border"
              value={values.service}
              onChange={handleChange('service') as any}
            >
              {services.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <Textarea
            placeholder="Votre message / besoins spécifiques"
            value={values.message}
            onChange={handleChange('message')}
            rows={4}
          />

          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={values.newsletter}
              onChange={handleChange('newsletter') as any}
            />
            <span>S'inscrire à notre newsletter & offres exclusives</span>
          </label>

          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
            Envoyer la demande
          </button>
          {/* <p className="text-sm text-gray-500">
            Nous vous recontacterons sous 24h et vous offrons 10% sur votre première réservation !
          </p> */}
        </motion.form>
      </motion.section>

      {/* Section témoignages */}
    </div>
  );
};

export default ContactPage;
