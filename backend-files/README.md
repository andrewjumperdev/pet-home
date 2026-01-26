# Backend Files - Maison pour Pets API

Sistema completo de backend para reservas y e-commerce.

## Estructura de Archivos

```
backend-files/
├── controllers/
│   ├── bookingController.js      → Gestión de reservas (confirmar, rechazar, cancelar, refund)
│   ├── capacityController.js     → Validación de capacidad (anti-overbooking)
│   ├── emailController.js        → Sistema de emails profesionales
│   ├── printfulController.js     → E-commerce con Printful
│   └── storePaymentController.js → Pagos de la tienda
├── middleware/
│   └── auth.js                   → Autenticación, rate limiting, seguridad
├── routes/
│   ├── bookingRoutes.js          → /api/bookings/*
│   ├── capacityRoutes.js         → /api/capacity/*
│   ├── emailRoutes.js            → /api/email/*
│   ├── printfulRoutes.js         → /api/printful/*
│   └── storeRoutes.js            → /api/store/*
└── README.md
```

## Instalación Rápida

### 1. Copiar archivos

```bash
cp -r backend-files/controllers/* ./controllers/
cp -r backend-files/routes/* ./routes/
cp -r backend-files/middleware/* ./middleware/
```

### 2. Instalar dependencias

```bash
npm install resend jsonwebtoken express-rate-limit firebase-admin axios stripe
```

### 3. Variables de entorno (.env)

```env
# ========== STRIPE ==========
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# ========== FIREBASE ADMIN ==========
FIREBASE_PROJECT_ID=pethome-db
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@pethome-db.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ========== EMAILS (Resend) ==========
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=Maison pour Pets <reservations@maisonpourpets.com>
ADMIN_EMAIL=admin@maisonpourpets.com
SITE_URL=https://maisonpourpets.com

# ========== SEGURIDAD ==========
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
ADMIN_API_KEY=your-admin-api-key-for-secure-endpoints
ADMIN_EMAILS=admin@maisonpourpets.com,manager@maisonpourpets.com

# ========== PRINTFUL ==========
PRINTFUL_API_KEY=xxxxx
PRINTFUL_STORE_ID=17547328
```

### 4. Actualizar server.js

```javascript
import express from 'express';
import cors from 'cors';

// Middleware
import { rateLimiter, securityLogger, validateOrigin } from './middleware/auth.js';

// Routes
import bookingRoutes from './routes/bookingRoutes.js';
import capacityRoutes from './routes/capacityRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import printfulRoutes from './routes/printfulRoutes.js';
import storeRoutes from './routes/storeRoutes.js';

const app = express();

// Middleware global
app.use(cors({
  origin: ['https://maisonpourpets.com', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(rateLimiter);
app.use(securityLogger);
app.use(validateOrigin());

// ========== RUTAS ==========

// Reservas
app.use('/api/bookings', bookingRoutes);

// Capacidad (disponibilidad)
app.use('/api/capacity', capacityRoutes);

// Emails
app.use('/api/email', emailRoutes);

// Printful (e-commerce)
app.use('/api/printful', printfulRoutes);

// Store (pagos tienda)
app.use('/api/store', storeRoutes);

// Tu ruta existente de pagos de reservas
// app.use('/api/payments', paymentRoutes);

app.listen(3000, () => {
  console.log('🚀 Server running on port 3000');
});
```

---

## Endpoints

### 📅 Reservas (`/api/bookings`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/cancel-policy` | No | Política de cancelación |
| GET | `/:id?email=xxx` | Email | Ver reserva (cliente) |
| GET | `/by-email/:email` | No | Reservas del cliente |
| POST | `/cancel` | Token | Cancelar + refund automático |
| POST | `/confirm` | Admin | Confirmar y cobrar |
| POST | `/reject` | Admin | Rechazar reserva |

### 📊 Capacidad (`/api/capacity`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/check?startDate=&endDate=&quantity=` | Verificar disponibilidad |
| GET | `/calendar?month=&year=` | Calendario del mes |
| POST | `/reserve` | Reservar temporalmente (15 min) |
| DELETE | `/reserve/:id` | Liberar reserva temporal |

### 📧 Emails (`/api/email`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/booking-received` | Email: solicitud recibida |
| POST | `/booking-confirmed` | Email: confirmación + pago |
| POST | `/booking-rejected` | Email: reserva rechazada |
| POST | `/booking-cancelled` | Email: cancelación + refund |

### 🛍️ Printful (`/api/printful`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/products` | Lista productos |
| GET | `/products/:id` | Detalle de producto |
| POST | `/shipping/rates` | Calcular envío |
| POST | `/orders` | Crear orden |
| GET | `/orders` | Listar órdenes |
| POST | `/webhook` | Webhook Printful |

---

## Flujo de Reserva Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CLIENTE RESERVA                                          │
├─────────────────────────────────────────────────────────────┤
│ Frontend → /api/capacity/check (verificar disponibilidad)   │
│ Frontend → /api/capacity/reserve (bloqueo temporal 15 min)  │
│ Frontend → Stripe SetupIntent (guarda tarjeta, NO cobra)    │
│ Frontend → Firebase addDoc (status: pending)                │
│ Backend  → /api/email/booking-received (email al cliente)   │
│ Backend  → /api/email/booking-received (email al admin)     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. ADMIN CONFIRMA                                           │
├─────────────────────────────────────────────────────────────┤
│ Admin Panel → /api/bookings/confirm (cobra Stripe)          │
│ Backend     → /api/email/booking-confirmed (email cliente)  │
│ Firebase    → status: confirmed, paymentStatus: paid        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. CLIENTE PUEDE CANCELAR                                   │
├─────────────────────────────────────────────────────────────┤
│ Email tiene link: /cancel/:bookingId?token=xxx              │
│ Cliente → /api/bookings/cancel                              │
│ Backend → Stripe Refund (según política)                    │
│ Backend → /api/email/booking-cancelled                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Política de Cancelación

```javascript
{
  freeCancellationDays: 3,      // Reembolso 100% hasta 3 días antes
  partialRefundPercentage: 50,  // Reembolso 50% después
  noRefundHours: 24             // Sin reembolso < 24 horas
}
```

---

## Seguridad Implementada

| Feature | Descripción |
|---------|-------------|
| **Rate Limiting** | 100 req/15min general, 10 req/hora para pagos |
| **API Key** | Endpoints admin requieren `X-API-KEY` header |
| **JWT Tokens** | Tokens de cancelación seguros con expiración |
| **Input Sanitization** | Limpieza automática de XSS/injection |
| **CORS** | Solo dominios autorizados |
| **Security Logging** | Log de accesos a endpoints sensibles |

### Usar API Key en Admin

```javascript
// Desde el frontend admin
fetch('/api/bookings/confirm', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'your-admin-api-key'
  },
  body: JSON.stringify({ bookingId: 'xxx' })
});
```

---

## Emails - Templates

Los emails tienen diseño profesional responsive:

1. **Booking Received** - Solicitud recibida (cliente + admin)
2. **Booking Confirmed** - Confirmación con detalles de llegada
3. **Booking Rejected** - Rechazo con invitación a reagendar
4. **Booking Cancelled** - Cancelación con info de reembolso

### Configurar Resend

1. Crear cuenta en [resend.com](https://resend.com)
2. Verificar dominio (agregar DNS records)
3. Obtener API Key
4. Agregar `RESEND_API_KEY` al .env

---

## Testing

```bash
# Verificar disponibilidad
curl "https://api.maisonpourpets.com/api/capacity/check?startDate=2024-02-15&quantity=2"

# Calendario del mes
curl "https://api.maisonpourpets.com/api/capacity/calendar?month=2&year=2024"

# Política de cancelación
curl "https://api.maisonpourpets.com/api/bookings/cancel-policy"

# Confirmar reserva (requiere API Key)
curl -X POST "https://api.maisonpourpets.com/api/bookings/confirm" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: your-admin-key" \
  -d '{"bookingId": "abc123"}'
```

---

## Integración Frontend

### Verificar disponibilidad antes de reservar

```typescript
// src/services/capacity.ts
const API_URL = import.meta.env.VITE_API_URL;

export async function checkAvailability(
  startDate: string,
  endDate: string,
  quantity: number
) {
  const params = new URLSearchParams({
    startDate,
    endDate,
    quantity: quantity.toString()
  });

  const response = await fetch(`${API_URL}/api/capacity/check?${params}`);
  return response.json();
}
```

### Enviar email después de crear booking

```typescript
// En Checkout.tsx después de crear el booking
await fetch(`${API_URL}/api/email/booking-received`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ booking: newBooking })
});
```

---

## Notas Importantes

- **Firebase Admin** requiere service account key (descargar desde Firebase Console)
- **Resend** tiene 3000 emails/mes gratis
- **Stripe Refunds** pueden tomar 5-10 días en aparecer
- Los **tokens de cancelación** expiran en 7 días
- Las **reservas temporales** expiran en 15 minutos
