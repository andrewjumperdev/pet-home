/**
 * Página de checkout para merchandising
 * Integra Stripe y Printful
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Package,
  Shield,
  Check,
  Loader2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { usePrintfulStore } from '../store/printfulStore';

// Configurar Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

// Pays de l'UE pour la livraison
const EU_COUNTRIES = [
  { code: 'FR', name: 'France' },
  { code: 'BE', name: 'Belgique' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'CH', name: 'Suisse' },
  { code: 'DE', name: 'Allemagne' },
  { code: 'ES', name: 'Espagne' },
  { code: 'PT', name: 'Portugal' },
  { code: 'IT', name: 'Italie' },
  { code: 'NL', name: 'Pays-Bas' },
  { code: 'AT', name: 'Autriche' },
  { code: 'IE', name: 'Irlande' },
  { code: 'PL', name: 'Pologne' },
  { code: 'SE', name: 'Suède' },
  { code: 'DK', name: 'Danemark' },
  { code: 'FI', name: 'Finlande' },
  { code: 'GR', name: 'Grèce' },
  { code: 'CZ', name: 'République tchèque' },
  { code: 'RO', name: 'Roumanie' },
  { code: 'HU', name: 'Hongrie' },
  { code: 'SK', name: 'Slovaquie' },
  { code: 'BG', name: 'Bulgarie' },
  { code: 'HR', name: 'Croatie' },
  { code: 'SI', name: 'Slovénie' },
  { code: 'LT', name: 'Lituanie' },
  { code: 'LV', name: 'Lettonie' },
  { code: 'EE', name: 'Estonie' },
  { code: 'CY', name: 'Chypre' },
  { code: 'MT', name: 'Malte' },
];

interface ShippingFormData {
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  stateCode?: string;
  countryCode: string;
  zip: string;
}

// Componente interno del formulario de pago
function CheckoutForm() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const {
    cart,
    getSubtotal,
    getTax,
    getTotal,
    getShippingCost,
    shippingRates,
    selectedShippingRate,
    isCalculatingShipping,
    shippingError,
    setShippingAddress,
    calculateShipping,
    selectShippingRate,
    clearCart,
  } = usePrintfulStore();

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ShippingFormData>({
    defaultValues: {
      countryCode: 'FR',
    },
  });

  const subtotal = getSubtotal();
  const tax = getTax();
  const shipping = getShippingCost();
  const total = getTotal();

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/store');
    }
  }, [cart, navigate]);

  // Manejar envío del formulario de dirección
  const onShippingSubmit = async (data: ShippingFormData) => {
    setShippingData(data);
    setShippingAddress({
      name: data.name,
      address1: data.address1,
      address2: data.address2,
      city: data.city,
      stateCode: data.stateCode,
      countryCode: data.countryCode,
      zip: data.zip,
      phone: data.phone,
      email: data.email,
    });

    await calculateShipping();
    setStep(2);
  };

  // Manejar el pago
  const handlePayment = async () => {
    if (!stripe || !elements || !shippingData || !selectedShippingRate) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Crear PaymentIntent en el backend con datos del pedido
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/store/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Stripe usa centavos
          currency: 'eur',
          metadata: {
            customer_email: shippingData.email,
            customer_name: shippingData.name,
            customer_phone: shippingData.phone,
            shipping_rate: selectedShippingRate.id,
            subtotal: subtotal.toFixed(2),
            shipping_cost: shipping.toFixed(2),
            tax: tax.toFixed(2),
          },
          // Datos completos del pedido para el webhook
          orderData: {
            shipping: {
              address1: shippingData.address1,
              address2: shippingData.address2,
              city: shippingData.city,
              stateCode: shippingData.stateCode,
              countryCode: shippingData.countryCode,
              zip: shippingData.zip,
            },
            items: cart.map((item) => ({
              syncVariantId: item.syncVariantId,
              quantity: item.quantity,
              name: item.name,
              price: item.price,
            })),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear el pago');
      }

      const { clientSecret } = await response.json();

      // 2. Confirmar el pago con Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Error con la tarjeta');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: shippingData.name,
              email: shippingData.email,
              phone: shippingData.phone,
              address: {
                line1: shippingData.address1,
                line2: shippingData.address2 || undefined,
                city: shippingData.city,
                postal_code: shippingData.zip,
                country: shippingData.countryCode,
              },
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        // 3. Crear orden en Printful a través del backend
        const orderResponse = await fetch(`${apiUrl}/api/printful/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient: {
              name: shippingData.name,
              address1: shippingData.address1,
              address2: shippingData.address2,
              city: shippingData.city,
              state_code: shippingData.stateCode,
              country_code: shippingData.countryCode,
              zip: shippingData.zip,
              phone: shippingData.phone,
              email: shippingData.email,
            },
            items: cart.map((item) => ({
              sync_variant_id: item.syncVariantId,
              quantity: item.quantity,
            })),
            retail_costs: {
              shipping: selectedShippingRate.rate,
            },
            paymentIntentId: paymentIntent.id,
          }),
        });

        if (!orderResponse.ok) {
          console.error('Error al crear orden en Printful, pero el pago fue exitoso');
        }

        // 4. Limpiar carrito y redirigir
        clearCart();
        navigate('/store/success', {
          state: {
            orderId: paymentIntent.id,
            email: shippingData.email,
          },
        });
      }
    } catch (err) {
      console.error('Error en el pago:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  // Watch form for country changes (for future use)
  watch('countryCode');

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate('/store')}
          className="mb-8 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour à la boutique
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Formulario */}
          <div className="lg:w-2/3">
            {/* Steps */}
            <div className="flex items-center gap-4 mb-8">
              <div
                className={`flex items-center gap-2 ${
                  step >= 1 ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= 1 ? 'bg-slate-900 text-white' : 'bg-slate-200'
                  }`}
                >
                  {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <span className="font-semibold">Livraison</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200" />
              <div
                className={`flex items-center gap-2 ${
                  step >= 2 ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= 2 ? 'bg-slate-900 text-white' : 'bg-slate-200'
                  }`}
                >
                  2
                </div>
                <span className="font-semibold">Paiement</span>
              </div>
            </div>

            {/* Step 1: Dirección de envío */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Adresse de livraison
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Entrez vos coordonnées pour recevoir votre commande
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Nombre */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        {...register('name', { required: 'Le nom est obligatoire' })}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                          errors.name
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-slate-200 focus:border-teal-500'
                        } focus:outline-none`}
                        placeholder="Votre nom complet"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        {...register('email', {
                          required: "L'email est obligatoire",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email invalide',
                          },
                        })}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                          errors.email
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-slate-200 focus:border-teal-500'
                        } focus:outline-none`}
                        placeholder="tu@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        {...register('phone', { required: 'Le téléphone est obligatoire' })}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                          errors.phone
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-slate-200 focus:border-teal-500'
                        } focus:outline-none`}
                        placeholder="+33 6 00 00 00 00"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                      )}
                    </div>

                    {/* País */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Pays *
                      </label>
                      <div className="relative">
                        <select
                          {...register('countryCode', { required: 'Sélectionnez un pays' })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none appearance-none bg-white"
                        >
                          {EU_COUNTRIES.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Código postal */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Code postal *
                      </label>
                      <input
                        type="text"
                        {...register('zip', { required: 'Le code postal est obligatoire' })}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                          errors.zip
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-slate-200 focus:border-teal-500'
                        } focus:outline-none`}
                        placeholder="75001"
                      />
                      {errors.zip && (
                        <p className="mt-1 text-sm text-red-500">{errors.zip.message}</p>
                      )}
                    </div>

                    {/* Dirección */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Adresse *
                      </label>
                      <input
                        type="text"
                        {...register('address1', { required: "L'adresse est obligatoire" })}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                          errors.address1
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-slate-200 focus:border-teal-500'
                        } focus:outline-none`}
                        placeholder="Rue, numéro, étage..."
                      />
                      {errors.address1 && (
                        <p className="mt-1 text-sm text-red-500">{errors.address1.message}</p>
                      )}
                    </div>

                    {/* Dirección 2 */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Complément d'adresse (optionnel)
                      </label>
                      <input
                        type="text"
                        {...register('address2')}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none"
                        placeholder="Appartement, bâtiment, etc."
                      />
                    </div>

                    {/* Ciudad */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Ville *
                      </label>
                      <input
                        type="text"
                        {...register('city', { required: 'La ville est obligatoire' })}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                          errors.city
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-slate-200 focus:border-teal-500'
                        } focus:outline-none`}
                        placeholder="Paris"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
                      )}
                    </div>

                    {/* Provincia/Estado */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Région (optionnel)
                      </label>
                      <input
                        type="text"
                        {...register('stateCode')}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none"
                        placeholder="Île-de-France"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    Continuer vers le paiement
                    <CreditCard className="w-5 h-5" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 2: Pago */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Opciones de envío */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Mode de livraison
                      </h2>
                      <p className="text-slate-500 text-sm">
                        Sélectionnez comment vous souhaitez recevoir votre commande
                      </p>
                    </div>
                  </div>

                  {isCalculatingShipping ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                      <span className="ml-3 text-slate-600">
                        Calcul des options de livraison...
                      </span>
                    </div>
                  ) : shippingRates.length > 0 ? (
                    <div className="space-y-3">
                      {shippingRates.map((rate) => (
                        <button
                          key={rate.id}
                          onClick={() => selectShippingRate(rate)}
                          className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                            selectedShippingRate?.id === rate.id
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedShippingRate?.id === rate.id
                                  ? 'border-teal-500 bg-teal-500'
                                  : 'border-slate-300'
                              }`}
                            >
                              {selectedShippingRate?.id === rate.id && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="text-left">
                              <p className="font-semibold text-slate-900">{rate.name}</p>
                              <p className="text-sm text-slate-500">
                                {rate.minDeliveryDays}-{rate.maxDeliveryDays} jours ouvrés
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-slate-900">
                            {parseFloat(rate.rate).toFixed(2)} €
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                      <p className="text-slate-600">
                        Aucune option de livraison disponible.
                        <br />
                        Veuillez vérifier votre adresse.
                      </p>
                      {shippingError && (
                        <p className="mt-2 text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2 inline-block">
                          Erreur : {shippingError}
                        </p>
                      )}
                      <button
                        onClick={() => setStep(1)}
                        className="mt-4 text-teal-600 font-semibold hover:underline"
                      >
                        Modifier l'adresse
                      </button>
                    </div>
                  )}
                </div>

                {/* Formulario de pago */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Informations de paiement
                      </h2>
                      <p className="text-slate-500 text-sm">
                        Paiement sécurisé avec Stripe
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Carte de crédit / débit
                    </label>
                    <div className="p-4 rounded-xl border-2 border-slate-200 focus-within:border-teal-500 transition-colors">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#1e293b',
                              '::placeholder': {
                                color: '#94a3b8',
                              },
                            },
                            invalid: {
                              color: '#ef4444',
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  {/* Mensaje de seguridad */}
                  <div className="flex items-center gap-2 mb-6 p-3 bg-green-50 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700">
                      Votre paiement est protégé par un cryptage SSL 256 bits
                    </span>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                    >
                      Retour
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={isProcessing || !selectedShippingRate || !stripe}
                      className="flex-1 py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Traitement en cours...
                        </>
                      ) : (
                        <>
                          Payer {total.toFixed(2)} €
                          <Check className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Resumen del pedido */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100 sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Récapitulatif de la commande
              </h3>

              {/* Productos */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.variantId} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-contain bg-slate-50 border border-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {item.variantName}
                      </p>
                      <p className="text-sm text-slate-600">
                        {item.quantity} x {item.price.toFixed(2)} €
                      </p>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {(item.price * item.quantity).toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total</span>
                  <span className="font-medium">{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>TVA (21%)</span>
                  <span className="font-medium">{tax.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Livraison</span>
                  <span className="font-medium">
                    {shipping > 0 ? `${shipping.toFixed(2)} €` : 'En cours...'}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-teal-600">{total.toFixed(2)} €</span>
                </div>
              </div>

              {/* Información adicional */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Truck className="w-4 h-4 text-teal-600" />
                  <span>Livraison dans toute l'Europe</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Shield className="w-4 h-4 text-teal-600" />
                  <span>Paiement 100% sécurisé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente wrapper con Elements de Stripe
export default function MerchCheckout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
