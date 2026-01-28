# PetHome

Plataforma web para una guardería privada de perros y gatos. PetHome centraliza la experiencia de clientes y administración: información de servicios, galería, contacto, reservas y un módulo de tienda con pagos integrados.

## ✨ Características destacadas

- **Sitio público completo**: home, servicios, galería, acerca de y contacto.
- **Solicitudes y comunicación**: formularios y contenido informativo para captar reservas.
- **Pagos integrados**: Stripe y PayPal para experiencias de checkout modernas.
- **Tienda con Printful**: catálogo, creación de órdenes y cálculo de envíos.
- **Calendario y automatización**: integración con Google Calendar.
- **Administración**: paneles internos para gestión de contenido.

## 🧱 Stack tecnológico

**Frontend**
- React + TypeScript + Vite
- Tailwind CSS
- Redux Toolkit y Zustand
- Stripe, PayPal
- Firebase

**Backend**
- Node.js + Express
- Stripe (Payments)
- Printful (Merchandising)

## 📂 Estructura del repositorio

```
.
├── server/              # Backend Express (Stripe + Printful)
├── src/                 # Frontend React
├── public/              # Recursos estáticos
└── vite.config.ts       # Configuración de Vite
```

## ✅ Requisitos

- Node.js 18+
- npm 9+

## ⚙️ Configuración de variables de entorno

Crea un archivo `.env` en la raíz del proyecto con los valores que necesites.

### Frontend (Vite)

```
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_STRIPE_PUBLIC_KEY=
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=
VITE_GOOGLE_API_KEY=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Backend (Express)

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PRINTFUL_API_KEY=
PRINTFUL_STORE_ID=
FRONTEND_URL=http://localhost:5173
PORT=3001
```

## ▶️ Uso local

Instala dependencias:

```
npm install
```

Levanta frontend y backend en paralelo:

```
npm run dev:all
```

Solo frontend:

```
npm run dev
```

Solo backend:

```
npm run server:dev
```

## 🧪 Calidad y linting

```
npm run lint
```

## 🚀 Build y despliegue

```
npm run build
```

Para publicar en GitHub Pages:

```
npm run deploy
```

## 🤝 Contribución

1. Crea una rama con tu feature o fix.
2. Mantén la coherencia con el estilo del proyecto.
3. Abre un pull request describiendo el cambio.

## 📬 Contacto

Si necesitas soporte o quieres colaborar, abre un issue en este repositorio.
