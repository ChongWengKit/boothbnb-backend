import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables first

import { prisma } from './lib/db.js';
import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import hostRoutes from './routes/host.routes.js';
import bookmarkRoutes from './routes/bookmark.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import accountRoutes from './routes/account.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import stripeRoutes from './routes/stripe.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import siteRoutes from './routes/site.routes.js';
import adminRoutes from './routes/admin.routes.js';
import cronRoutes from './routes/cron.routes.js';

import './job/booking-cleanup.js';
import './job/email-retry.js';
import './job/email-sync.js';
//test
const app = express();
const port = process.env.PORT || 3001;
const allowedOrigins = [
  process.env.FRONTEND_DOMAIN
];
app.use(cors({

  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
  
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.options(/^(.*)$/, cors());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Boothbnb API is running' });
});

// Middleware for Stripe webhooks to get raw body for signature verification
// This MUST come BEFORE express.json() if the webhook expects a raw body
app.use('/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// Other webhooks that expect JSON body (like Resend)
app.use('/webhook', webhookRoutes);

app.use('/auth', authRoutes);
app.use('/event', eventRoutes);
app.use('/host', hostRoutes);
app.use('/bookmark', bookmarkRoutes);
app.use('/upload', uploadRoutes);
app.use('/account', accountRoutes)
app.use('/payment', paymentRoutes)
// All other Stripe routes (non-webhook)
app.use('/stripe', stripeRoutes) 
app.use('/booking', bookingRoutes)
app.use('/site', siteRoutes)
app.use('/admin', adminRoutes)
app.use('/cron', cronRoutes); 

// 404 Handler - Catch all routes that aren't defined above
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;