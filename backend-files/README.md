# Backend Files - Integración Printful & Store

Estos archivos deben copiarse a tu backend existente en `api.maisonpourpets.com`.

## Estructura de Archivos

```
backend-files/
├── controllers/
│   ├── printfulController.js   → Copiar a tu carpeta controllers/
│   └── storePaymentController.js → Copiar a tu carpeta controllers/
├── routes/
│   ├── printfulRoutes.js       → Copiar a tu carpeta routes/
│   └── storeRoutes.js          → Copiar a tu carpeta routes/
└── README.md
```

## Instalación

### 1. Copiar archivos a tu backend

```bash
# Desde tu carpeta de backend
cp -r backend-files/controllers/* ./controllers/
cp -r backend-files/routes/* ./routes/
```

### 2. Agregar variables de entorno

Agregar a tu `.env`:

```env
# Printful
PRINTFUL_API_KEY=oMccnDUjkxnV6eMUbrlvjTur8XCjaPNk52gdxQrk
PRINTFUL_STORE_ID=17547328

# Stripe Webhook para Store (opcional, para producción)
STRIPE_STORE_WEBHOOK_SECRET=whsec_xxxxx
```

### 3. Actualizar server.js

Agregar estas líneas a tu archivo principal del servidor:

```javascript
// Importar nuevas rutas
import printfulRoutes from "./routes/printfulRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";

// ... después de tus otras rutas ...

// Rutas de Printful (e-commerce)
app.use("/api/printful", printfulRoutes);

// Rutas del Store (pagos)
app.use("/api/store", storeRoutes);
```

### 4. Instalar dependencia (si no la tienes)

```bash
npm install axios
```

## Endpoints Disponibles

### Printful (Productos y Órdenes)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/printful/products` | Lista todos los productos |
| GET | `/api/printful/products/:id` | Detalle de producto con variantes |
| POST | `/api/printful/shipping/rates` | Calcular tarifas de envío |
| GET | `/api/printful/orders` | Lista órdenes |
| GET | `/api/printful/orders/:id` | Detalle de orden |
| POST | `/api/printful/orders` | Crear orden |
| POST | `/api/printful/webhook` | Webhook de Printful |

### Store (Pagos)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/store/create-payment-intent` | Crear pago Stripe |
| POST | `/api/store/webhook` | Webhook de Stripe |

## Pruebas

Una vez desplegado, probar con:

```bash
# Obtener productos
curl https://api.maisonpourpets.com/api/printful/products

# Obtener producto específico
curl https://api.maisonpourpets.com/api/printful/products/414334849
```

## Flujo de Compra

1. **Frontend**: Usuario agrega productos al carrito
2. **Frontend**: Usuario va al checkout y llena datos de envío
3. **Backend**: `POST /api/printful/shipping/rates` - Calcula envío
4. **Backend**: `POST /api/store/create-payment-intent` - Crea PaymentIntent
5. **Frontend**: Usuario completa pago con Stripe Elements
6. **Backend**: `POST /api/printful/orders` - Crea orden en Printful
7. **Printful**: Webhook notifica cuando se envía el paquete

## Notas Importantes

- El `X-PF-Store-Id` header es OBLIGATORIO para Printful
- Las órdenes se crean y confirman automáticamente
- El webhook de Printful notifica el tracking del envío
- Los pagos usan metadata `type: "store_purchase"` para distinguirlos de reservas
