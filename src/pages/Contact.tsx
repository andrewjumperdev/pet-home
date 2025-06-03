// src/pages/ContactPage.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';

import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  petType: 'dog' | 'cat' | '';
  companionName: string;
  companionBreed: string;
  companionAge: string;
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

const fieldAnim = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const ContactPage: React.FC = () => {
  const [values, setValues] = React.useState<ContactFormValues>({
    name: '',
    email: '',
    phone: '',
    petType: '',
    companionName: '',
    companionBreed: '',
    companionAge: '',
    service: services[0],
    message: '',
    newsletter: false,
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleChange = (field: keyof ContactFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value =
      e.currentTarget.type === 'checkbox'
        ? (e.currentTarget as HTMLInputElement).checked
        : e.currentTarget.value;
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await addDoc(collection(db, 'contacts'), {
        ...values,
        timestamp: new Date()
      });
      setSuccess(true);
      setValues({
        name: '',
        email: '',
        phone: '',
        petType: '',
        companionName: '',
        companionBreed: '',
        companionAge: '',
        service: services[0],
        message: '',
        newsletter: false,
      });
    } catch (err) {
      console.error(err);
      setError('Error al enviar, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 mt-20">
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Contact info card */}
        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Contactez-nous</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-2">
              <MapPin />
              <p>Paris, France</p>
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

          {/* Datos básicos */}
          <motion.div
            variants={fieldAnim}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
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
          </motion.div>

          {/* Pregunta tipo de mascota */}
          <AnimatePresence>
            {!values.petType && (
              <motion.div
                key="petType"
                variants={fieldAnim}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <select
                  className="w-full p-2 rounded-lg border"
                  value={values.petType}
                  onChange={handleChange('petType')}
                  required
                >
                  <option value="" disabled>¿Chien o Chat?</option>
                  <option value="dog">Chien</option>
                  <option value="cat">Chat</option>
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Campos condicionales */}
          <AnimatePresence>
            {values.petType && (
              <motion.div
                key="companionFields"
                variants={fieldAnim}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <Input
                  placeholder={
                    values.petType === 'dog' ? 'Nom du chien' : 'Nom du chat'
                  }
                  value={values.companionName}
                  onChange={handleChange('companionName')}
                  required
                />
                {values.petType === 'dog' && (
                  <Input
                    placeholder="Race du chien"
                    value={values.companionBreed}
                    onChange={handleChange('companionBreed')}
                    required
                  />
                )}
                <Input
                  placeholder={
                    values.petType === 'dog' ? 'Âge du chien' : 'Âge du chat'
                  }
                  type="number"
                  value={values.companionAge}
                  onChange={handleChange('companionAge')}
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Servicio y mensaje */}
          <motion.div variants={fieldAnim} initial="initial" animate="animate" className="space-y-4">
            <select
              className="w-full p-2 rounded-lg border"
              value={values.service}
              onChange={handleChange('service')}
              required
            >
              {services.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Textarea
              placeholder="Votre message / besoins spécifiques"
              value={values.message}
              onChange={handleChange('message')}
              rows={4}
              required
            />
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={values.newsletter}
                onChange={handleChange('newsletter')}
              />
              <span>S'inscrire à notre newsletter & offres exclusives</span>
            </label>
          </motion.div>

          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-600">¡Solicitud enviada correctamente!</p>}

          <motion.button
            type="submit"
            disabled={loading}
            variants={fieldAnim}
            initial="initial"
            animate="animate"
            className={`w-full py-2 rounded-lg text-white transition
              ${loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {loading ? 'Enviando...' : 'Envoyer la demande'}
          </motion.button>
        </motion.form>
      </motion.section>
    </div>
  );
};

export default ContactPage;
