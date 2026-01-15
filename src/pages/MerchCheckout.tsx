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

// Países de la UE para envío
const EU_COUNTRIES = [
  { code: 'ES', name: 'España' },
  { code: 'PT', name: 'Portugal' },
  { code: 'FR', name: 'Francia' },
  { code: 'DE', name: 'Alemania' },
  { code: 'IT', name: 'Italia' },
  { code: 'NL', name: 'Países Bajos' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'AT', name: 'Austria' },
  { code: 'IE', name: 'Irlanda' },
  { code: 'PL', name: 'Polonia' },
  { code: 'SE', name: 'Suecia' },
  { code: 'DK', name: 'Dinamarca' },
  { code: 'FI', name: 'Finlandia' },
  { code: 'GR', name: 'Grecia' },
  { code: 'CZ', name: 'República Checa' },
  { code: 'RO', name: 'Rumanía' },
  { code: 'HU', name: 'Hungría' },
  { code: 'SK', name: 'Eslovaquia' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croacia' },
  { code: 'SI', name: 'Eslovenia' },
  { code: 'LT', name: 'Lituania' },
  { code: 'LV', name: 'Letonia' },
  { code: 'EE', name: 'Estonia' },
  { code: 'CY', name: 'Chipre' },
  { code: 'LU', name: 'Luxemburgo' },
  { code: 'MT', name: 'Malta' },
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
      countryCode: 'ES',
    },
  });

  const subtotal = getSubtotal();
  const tax = getTax();
  const shipping = getShippingCost();
  const total = getTotal();

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/merch');
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
      // 1. Crear PaymentIntent en el backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Stripe usa centavos
          currency: 'eur',
          metadata: {
            customer_email: shippingData.email,
            shipping_rate: selectedShippingRate.id,
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
        navigate('/merch/success', {
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
          onClick={() => navigate('/merch')}
          className="mb-8 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a la tienda
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
                <span className="font-semibold">Envío</span>
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
                <span className="font-semibold">Pago</span>
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
                      Dirección de envío
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Ingresa los datos para recibir tu pedido
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Nombre */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        {...register('name', { required: 'El nombre es obligatorio' })}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                          errors.name
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-slate-200 focus:border-teal-500'
                        } focus:outline-none`}
                        placeholder="Tu nombre completo"
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
                          required: 'El email es obligatorio',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email inválido',
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
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        {...register('phone', { required: 'El teléfono es obligatorio' })}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                          errors.phone
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-slate-200 focus:border-teal-500'
                        } focus:outline-none`}
                        placeholder="+34 600 000 000"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                      )}
                    </div>

                    {/* País */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        País *
                      </label>
                      <div className="relative">
                        <select
                          {...register('countryCode', { required: 'Selecciona un país' })}
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
                        Código postal *
                      </label>
                      <input
                        type="text"
                        {...register('zip', { required: 'El código postal es obligatorio' })}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                          errors.zip
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-slate-200 focus:border-teal-500'
                        } focus:outline-none`}
                        placeholder="28001"
                      />
                      {errors.zip && (
                        <p className="mt-1 text-sm text-red-500">{errors.zip.message}</p>
                      )}
                    </div>

                    {/* Dirección */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Dirección *
                      </label>
                      <input
                        type="text"
                        {...register('address1', { required: 'La dirección es obligatoria' })}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                          errors.address1
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-slate-200 focus:border-teal-500'
                        } focus:outline-none`}
                        placeholder="Calle, número, piso..."
                      />
                      {errors.address1 && (
                        <p className="mt-1 text-sm text-red-500">{errors.address1.message}</p>
                      )}
                    </div>

                    {/* Dirección 2 */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Información adicional (opcional)
                      </label>
                      <input
                        type="text"
                        {...register('address2')}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none"
                        placeholder="Apartamento, suite, etc."
                      />
                    </div>

                    {/* Ciudad */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        {...register('city', { required: 'La ciudad es obligatoria' })}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                          errors.city
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-slate-200 focus:border-teal-500'
                        } focus:outline-none`}
                        placeholder="Madrid"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
                      )}
                    </div>

                    {/* Provincia/Estado */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Provincia/Estado
                      </label>
                      <input
                        type="text"
                        {...register('stateCode')}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none"
                        placeholder="Madrid"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    Continuar al pago
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
                        Método de envío
                      </h2>
                      <p className="text-slate-500 text-sm">
                        Selecciona cómo quieres recibir tu pedido
                      </p>
                    </div>
                  </div>

                  {isCalculatingShipping ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                      <span className="ml-3 text-slate-600">
                        Calculando opciones de envío...
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
                                {rate.minDeliveryDays}-{rate.maxDeliveryDays} días laborables
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
                        No se encontraron opciones de envío disponibles.
                        <br />
                        Por favor, verifica tu dirección.
                      </p>
                      <button
                        onClick={() => setStep(1)}
                        className="mt-4 text-teal-600 font-semibold hover:underline"
                      >
                        Modificar dirección
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
                        Información de pago
                      </h2>
                      <p className="text-slate-500 text-sm">
                        Pago seguro con Stripe
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Tarjeta de crédito/débito
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
                      Tu pago está protegido con encriptación SSL de 256 bits
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
                      Volver
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={isProcessing || !selectedShippingRate || !stripe}
                      className="flex-1 py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          Pagar {total.toFixed(2)} €
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
                Resumen del pedido
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
                  <span>Subtotal</span>
                  <span className="font-medium">{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>IVA (21%)</span>
                  <span className="font-medium">{tax.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Envío</span>
                  <span className="font-medium">
                    {shipping > 0 ? `${shipping.toFixed(2)} €` : 'Calculando...'}
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
                  <span>Envío a toda Europa</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Shield className="w-4 h-4 text-teal-600" />
                  <span>Pago 100% seguro</span>
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
