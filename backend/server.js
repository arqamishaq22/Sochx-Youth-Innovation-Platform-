const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');

// Load environment variables
dotenv.config();

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const ideaRoutes = require('./routes/ideaRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize Express App
const app = express();

// ==============================================================================
// 1. CORS CONFIGURATION & PRE-FLIGHT HANDLING
// ==============================================================================
const allowedOrigins = [
  'http://localhost:5173', // Vite default dev server
  'http://localhost:3000', // React default dev server
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }
    // Allow any localhost or 127.0.0.1 port in development
    const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (isLocal || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Dev-permissive fallback
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  optionsSuccessStatus: 200, // For legacy browser preflight support
};

app.use(cors(corsOptions));
// Cleanly handle all pre-flight OPTIONS requests across all routes
app.options('*', cors(corsOptions));

// ==============================================================================
// 2. BODY PARSING MIDDLEWARE
// ==============================================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==============================================================================
// 3. HEALTH CHECK & ROOT ROUTES
// ==============================================================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    database: 'XAMPP MySQL / MariaDB (sochx_db)',
    service: 'SochX API Server',
    uptime: `${process.uptime().toFixed(2)}s`,
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to SochX: Where Ideas Go Live (MySQL Backend API)',
    health: '/api/health',
    endpoints: {
      auth: '/api/auth',
      ideas: '/api/ideas',
      users: '/api/users',
    },
  });
});

// ==============================================================================
// 4. API ROUTE MOUNTING
// ==============================================================================
app.use('/api/auth', authRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// ==============================================================================
// 5. 404 NOT FOUND HANDLER
// ==============================================================================
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route Not Found',
    path: req.originalUrl,
  });
});

// ==============================================================================
// 6. GLOBAL ERROR HANDLING MIDDLEWARE
// ==============================================================================
app.use((err, req, res, next) => {
  console.error(`[SochX Server Error] ${req.method} ${req.url}:`, err.message);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ==============================================================================
// 7. SERVER INITIALIZATION & DATABASE CHECK
// ==============================================================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log('[SochX] Testing XAMPP MySQL database connectivity...');
  const isConnected = await testConnection();

  if (!isConnected) {
    console.warn('[SochX Warning] Starting HTTP server despite database warning. Verify XAMPP MySQL.');
  }

  app.listen(PORT, () => {
    console.log('====================================================================');
    console.log(`🚀 SochX Backend API Server running on port ${PORT}`);
    console.log(`🌐 Base URL:      http://localhost:${PORT}`);
    console.log(`🩺 Health Check:  http://localhost:${PORT}/api/health`);
    console.log(`💡 Ideas API:     http://localhost:${PORT}/api/ideas`);
    console.log(`🔑 Auth API:      http://localhost:${PORT}/api/auth`);
    console.log(`👤 Users API:     http://localhost:${PORT}/api/users`);
    console.log('====================================================================');
  });
};

startServer();

module.exports = app;
