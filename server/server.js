import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for auditability
app.use((req, res, next) => {
  if (req.path.startsWith('/api') && req.path !== '/api/health') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Fallback Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: "NexusPole Polar Command Backend is operational",
    docs: "/api/health",
    system: "Integrated Polar Expedition Logistics & Asset Management System (SIH 26062)"
  });
});

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`NexusPole Polar Command Core active on port ${PORT}`);

});

process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

