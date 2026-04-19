import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

import './job/booking-cleanup.js';
import './job/email-retry.js';
import './job/email-sync.js';
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use('/webhook', webhookRoutes);

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/event', eventRoutes);
app.use('/host', hostRoutes);
app.use('/bookmark', bookmarkRoutes);
app.use('/upload', uploadRoutes);
app.use('/account', accountRoutes)
app.use('/payment', paymentRoutes)
app.use('/stripe', stripeRoutes)
app.use('/booking', bookingRoutes)
app.use('/site', siteRoutes)
app.use('/admin', adminRoutes)

app.listen(port, () => {
  prisma.$connect()
    .then(() => console.log('Database connected successfully via Prisma!'))
    .catch((err) => console.error('Database connection failed:', err));
});
