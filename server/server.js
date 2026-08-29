import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedSchemesIfEmpty } from './utils/seedSchemes.js';
import { seedAdminUser } from './utils/seedAdmin.js';
import { verifyEmailConnection } from './utils/emailService.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import eligibilityRoutes from './routes/eligibilityRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'Government Scheme Eligibility Platform API is running.',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.originalUrl}`
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Start Server & Connect Database
const startServer = async () => {
  try {
    await connectDB();
    await seedAdminUser();
    await seedSchemesIfEmpty();
    await verifyEmailConnection();

    const server = app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(` 🚀 SchemeSetu Backend Server active on port ${PORT}`);
      console.log(` 📍 API Base URL: http://localhost:${PORT}/api`);
      console.log(`===================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[Server Error] Port ${PORT} is already in use by another running instance.`);
        console.error(`Please terminate the existing process on port ${PORT} or restart the terminal.\n`);
      } else {
        console.error('[Server Error]', err);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('[Fatal Error] Failed to start backend server:', error);
    process.exit(1);
  }
};

export { app, startServer };

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  startServer();
}
