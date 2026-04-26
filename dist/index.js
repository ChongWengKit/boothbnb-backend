import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
import currencyRoutes from './routes/currency.routes.js';
import './job/booking-cleanup.js';
import './job/email-retry.js';
import './job/email-sync.js';
import './job/currency-rate.js';
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
const allowedOrigins = [
    process.env.FRONTEND_DOMAIN
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.options('*splat', cors());
app.use('/webhook', webhookRoutes);
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/event', eventRoutes);
app.use('/host', hostRoutes);
app.use('/bookmark', bookmarkRoutes);
app.use('/upload', uploadRoutes);
app.use('/account', accountRoutes);
app.use('/payment', paymentRoutes);
app.use('/stripe', stripeRoutes);
app.use('/booking', bookingRoutes);
app.use('/site', siteRoutes);
app.use('/admin', adminRoutes);
app.use('/cron', cronRoutes);
app.use('/currency', currencyRoutes);
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
export default app;
//# sourceMappingURL=index.js.map