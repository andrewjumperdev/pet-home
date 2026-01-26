/**
 * Middleware de Autenticación y Seguridad
 * Protege endpoints sensibles del backend
 */

import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import admin from 'firebase-admin';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

/**
 * Rate Limiter - Previene ataques de fuerza bruta
 */
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Demasiadas solicitudes',
    message: 'Por favor, espera antes de intentar de nuevo',
    retryAfter: 15
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiter estricto para endpoints sensibles (pagos)
 */
export const strictRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 intentos de pago por hora
  message: {
    error: 'Límite de intentos alcanzado',
    message: 'Demasiados intentos de pago. Intenta más tarde.',
    retryAfter: 60
  }
});

/**
 * Middleware: Verificar API Key para endpoints de admin
 */
export const verifyAdminApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!ADMIN_API_KEY) {
    console.warn('⚠️ ADMIN_API_KEY no configurado');
    return next(); // En desarrollo, permitir sin API key
  }

  if (!apiKey) {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'API Key requerida'
    });
  }

  if (apiKey !== ADMIN_API_KEY) {
    console.warn(`🚫 Intento de acceso con API Key inválida: ${apiKey.slice(0, 8)}...`);
    return res.status(403).json({
      error: 'Prohibido',
      message: 'API Key inválida'
    });
  }

  next();
};

/**
 * Middleware: Verificar JWT Token
 */
export const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'Token requerido'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'Por favor, inicia sesión de nuevo'
      });
    }
    return res.status(403).json({
      error: 'Token inválido',
      message: 'No se pudo verificar el token'
    });
  }
};

/**
 * Middleware: Verificar Firebase ID Token (para auth con Firebase)
 */
export const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'Token de Firebase requerido'
    });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('❌ Error verificando Firebase token:', error.message);
    return res.status(403).json({
      error: 'Token inválido',
      message: 'No se pudo verificar el token de Firebase'
    });
  }
};

/**
 * Middleware: Verificar rol de admin
 */
export const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'Debes iniciar sesión'
    });
  }

  // Verificar si el usuario es admin (por email o rol)
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  const isAdmin = adminEmails.includes(req.user.email) || req.user.admin === true;

  if (!isAdmin) {
    console.warn(`🚫 Acceso admin denegado: ${req.user.email}`);
    return res.status(403).json({
      error: 'Prohibido',
      message: 'Se requieren permisos de administrador'
    });
  }

  next();
};

/**
 * Middleware: Validar origen de la solicitud (CORS estricto)
 */
export const validateOrigin = (allowedOrigins = []) => {
  return (req, res, next) => {
    const origin = req.headers.origin;
    const defaultOrigins = [
      'https://maisonpourpets.com',
      'https://www.maisonpourpets.com',
      'http://localhost:5173', // Desarrollo
      'http://localhost:3000'
    ];

    const allAllowedOrigins = [...defaultOrigins, ...allowedOrigins];

    if (!origin || allAllowedOrigins.includes(origin)) {
      next();
    } else {
      console.warn(`🚫 Origen no permitido: ${origin}`);
      return res.status(403).json({
        error: 'Origen no permitido',
        message: 'Esta solicitud no está autorizada'
      });
    }
  };
};

/**
 * Middleware: Logging de seguridad
 */
export const securityLogger = (req, res, next) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    origin: req.headers.origin,
    userId: req.user?.uid || req.user?.email || 'anonymous'
  };

  // Log solo para endpoints sensibles
  const sensitiveEndpoints = ['/charge-payment', '/refund', '/admin', '/orders'];
  if (sensitiveEndpoints.some(ep => req.path.includes(ep))) {
    console.log('🔐 Security Log:', JSON.stringify(logData));
  }

  next();
};

/**
 * Middleware: Sanitizar inputs
 */
export const sanitizeInputs = (req, res, next) => {
  // Función recursiva para sanitizar
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Remover caracteres peligrosos
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key of Object.keys(obj)) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);

  next();
};

/**
 * Generar token JWT para admin
 */
export const generateAdminToken = (email, expiresIn = '24h') => {
  return jwt.sign(
    { email, admin: true, generatedAt: Date.now() },
    JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Generar token de cancelación para booking
 */
export const generateCancelToken = (bookingId) => {
  return jwt.sign(
    { bookingId, type: 'cancel', generatedAt: Date.now() },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Verificar token de cancelación
 */
export const verifyCancelToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'cancel') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    return null;
  }
};

export default {
  rateLimiter,
  strictRateLimiter,
  verifyAdminApiKey,
  verifyJWT,
  verifyFirebaseToken,
  requireAdmin,
  validateOrigin,
  securityLogger,
  sanitizeInputs,
  generateAdminToken,
  generateCancelToken,
  verifyCancelToken
};
