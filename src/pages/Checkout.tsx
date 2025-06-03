import { useEffect, useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Calendar as CalendarIcon, Info, User } from "lucide-react";
import { db } from "../lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { services as allServices } from "./Services";
import { CreateOrderActions, OnApproveActions } from "@paypal/paypal-js";


// type PayPalActions = {
//   order: {
//     create: (data: any) => Promise<string>;
//     capture: () => Promise<any>;
//   };
// };


export default function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { service: serviceData, selectedRange, quantity, sizes, details } =
        location.state || {};
    const [contact, setContact] = useState({ name: "", email: "" });
    const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
    const [datepickerRange, setDatepickerRange] = useState<[Date, Date]>(
        selectedRange || [new Date(), new Date()],
    );

    const isFormValid = () =>
    contact.name.trim() !== "" &&
    /^\S+@\S+\.\S+$/.test(contact.email);

    if (!serviceData || !selectedRange) {
        return (
            <p className="text-red-500 text-center mt-20">
                Informations manquantes.
            </p>
        );
    }

    const service = allServices.find((s) => s.id === serviceData.id)!;
    const [start, end] = datepickerRange;
    const days =
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;
    const rate = service.type === "cat"
        ? 15
        : sizes.includes("Gros chien")
        ? 30
        : 25;
    const total = days * rate * quantity;

    const validateContact = () => {
        const errs: any = {};
        if (!contact.name.trim()) errs.name = "Nom requis";
        if (!/^\S+@\S+\.\S+$/.test(contact.email)) {
            errs.email = "Email invalide";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

        const createOrder = (_: any, actions: CreateOrderActions): Promise<string> => {
        return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
            {
                amount: {
                  currency_code: "EUR",
                  value: total.toFixed(2),
                },
            },
            ],
        });
        };



const onApprove = async (_: any, actions: OnApproveActions) => {
  const order = await actions.order!.capture();
  console.log("✅ Pago aprobado:", order);

  // grabar cada día…
  let curr = new Date(start);
  while (curr <= end) {
    try {
      const docRef = await addDoc(collection(db, "bookings"), {
        serviceId: service.id,
        date: curr.toISOString().split("T")[0],
        quantity,
        sizes,
        details,
        contact,
        paymentId: order.id,
        createdAt: new Date().toISOString(),
      });
      console.log("  📄 Documento creado:", docRef.id);
    } catch (e) {
      console.error("❌ Error al guardar booking:", e);
    }
    curr.setDate(curr.getDate() + 1);
  }

  navigate("/success", {
    state: {
      order,
      contact,
      serviceId: service.id,
      dates: [start, end],
      bookingCount: days,
    },
  });
};


const handleError = (err: any) => {
  console.error("Erreur PayPal:", err);
  navigate("/error", { state: { error: err.toString() } });
};

const handleCancel = (data: any) => {
  console.log("Paiement annulé:", data);
  navigate("/error", { state: { cancelled: true } });
};


    useEffect(() => window.scrollTo(0, 0), []);

    return (
        <motion.div
            className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-2xl mx-auto space-y-8 mt-15">
                {/* Progress Indicator */}
                <div className="flex justify-center space-x-4">
                    {["Dates", "Info", "Paiement"].map((step, i) => (
                        <div key={i} className="flex items-center">
                            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                                {i + 1}
                            </span>
                            <span className="ml-2 text-gray-700 uppercase text-sm">
                                {step}
                            </span>
                            {i < 2 && (
                                <div className="w-8 h-1 bg-gray-300 mx-2" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Dates Picker */}
                <motion.section
                    className="bg-white rounded-xl shadow p-6 flex flex-col items-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <CalendarIcon className="mr-2 text-blue-500" />{" "}
                        Sélection des dates
                    </h2>
                    <Calendar
                        selectRange
                        onChange={(r) =>
                            Array.isArray(r) &&
                            r[0] instanceof Date &&
                            r[1] instanceof Date &&
                            setDatepickerRange([r[0], r[1]])}
                        value={datepickerRange}
                        className="rounded"
                    />
                    <p className="mt-2 text-center text-gray-600">
                        {start.toLocaleDateString("fr-FR")} →{" "} {end.toLocaleDateString("fr-FR")} 
                    </p>
                        <p className="mt-2 text-center text-gray-600">
                        ({days} jours)
                    </p>
                </motion.section>

                {/* Contact Info */}
                <motion.section
                    className="bg-white rounded-xl shadow p-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <User className="mr-2 text-blue-500" /> Vos coordonnées
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium">
                                Nom complet
                            </label>
                            <input
                                type="text"
                                value={contact.name}
                                onChange={(e) =>
                                    setContact({
                                        ...contact,
                                        name: e.target.value,
                                    })}
                                onBlur={validateContact}
                                className="mt-1 w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Jean Dupont"
                            />
                            {errors.name && (
                                <p className="text-red-600 text-xs mt-1">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">
                                Email
                            </label>
                            <input
                                type="email"
                                value={contact.email}
                                onChange={(e) =>
                                    setContact({
                                        ...contact,
                                        email: e.target.value,
                                    })}
                                onBlur={validateContact}
                                className="mt-1 w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="jean@exemple.com"
                            />
                            {errors.email && (
                                <p className="text-red-600 text-xs mt-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.section>

                {/* Summary & PayPal */}
                <motion.section
                    className="bg-white rounded-xl shadow p-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Info className="mr-2 text-blue-500" />{" "}
                        Récapitulatif & Paiement
                    </h2>
                    <div className="space-y-2 mb-4">
                        <p>
                            <strong>Service:</strong>{" "}
                            <span className="text-blue-600">
                                {service.title}
                            </span>
                        </p>
                        <p>
                            <strong>Quantité:</strong> {quantity}
                        </p>
                        <p>
                            <strong>Tailles:</strong> {sizes.join(", ")}
                        </p>
                        <p className="text-lg font-bold mt-2">
                            Total&nbsp;:{" "}
                            <span className="text-green-600">
                                {total.toFixed(2)} €
                            </span>
                        </p>
                    </div>
                    {isFormValid() && (
                        <PayPalScriptProvider
                            options={{
                                    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
                                    currency: "EUR",
                                    locale: "fr_FR",
                                    components: "buttons",
                            }}
                        >
                            <div className="w-full flex justify-center">
                                <div className="w-full max-w-md z-10">
                                    <PayPalButtons
                                    style={{
                                        layout: "horizontal",
                                        shape: "rect",
                                        color: "black",
                                        label: "pay",
                                    }}
                                    fundingSource={window?.paypal?.FUNDING?.CARD}
                                    createOrder={createOrder}
                                    onApprove={onApprove}
                                    onError={handleError}
                                    onCancel={handleCancel}
                                    forceReRender={[total]}
                                    />

                                </div>
                            </div>
                        </PayPalScriptProvider>
                    )}


                </motion.section>
            </div>
        </motion.div>
    );
}
