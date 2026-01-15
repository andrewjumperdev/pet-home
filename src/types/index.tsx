import { DogIcon } from "lucide-react";
import { JSX } from "react";

export type Service = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  rates: string[];
  icon: JSX.Element;
  type: "dog" | "cat";
};

export const services: Service[] = [
  {
    id: 1,
    title: "FORMULE FLASH",
    subtitle: "Journée",
    description: "Parfait pour des escapades courtes",
    rates: ["20€/jour (4h à 9h)", "12€ la demi-journée (1h à 4h)", "2 chiens: -10% sur le 2ème chien"],
    icon: <DogIcon className="h-10 w-10 text-yellow-500" />,
    type: "dog",
  },
];

export type PetDetail = {
  name: string;
  breed: string;
  age: string;
};

export type BookingFormData = {
  selectedRange: [Date, Date] | null;
  quantity: number;
  sizes: string[];
  details: PetDetail[];
  arrivalTime: string;
  departureTime: string;
  isSterilized: string;
};

export type ValidationErrors = {
  name: boolean;
  breed: boolean;
  age: boolean;
};

export type BookingStatus = "pending" | "confirmed" | "rejected" | "cancelled";

export type Booking = {
  id: string;
  createdAt: string;
  date: string;
  contact: { name: string; email: string; phone?: string };
  details: Array<{ name: string; age: string; breed: string }>;
  sizes: string[];
  quantity: number;
  serviceId: number | string;
  paymentId: string | null; // Puede ser null si aún no se ha cobrado
  paymentMethodId?: string; // ID del método de pago guardado
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded'; // Estado del pago
  status: BookingStatus;
  total: number;
  arrivalTime?: string;
  departureTime?: string;
  isSterilized?: boolean;
  rejectionReason?: string;
  confirmedAt?: string;
  rejectedAt?: string;
};

export type AvailabilityConfig = {
  maxCapacity: number;
  currentBookings: number;
  date: string;
};