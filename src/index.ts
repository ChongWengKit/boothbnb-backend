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
import rateLimit from 'express-rate-limit';
import './job/bookingCleanUp.job.js';
import './job/emailRetry.job.js';
import './job/emailSync.job.js';
import './job/currencyRate.job.js';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerPath = path.join(__dirname, 'swagger-output.json');

const swaggerFile = fs.existsSync(swaggerPath)
  ? (JSON.parse(await fs.promises.readFile(swaggerPath, 'utf8')) as Record<string, unknown>)
  : (await import('./swagger-generator.js')).createSwaggerDocument();

const app = express();
const port = process.env.PORT || 3001;
const allowedOrigins = [
  process.env.FRONTEND_DOMAIN,
  process.env.DOMAIN,
];
const swaggerOptions = {
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js'
  ]
};

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile, swaggerOptions));
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
app.options('*splat', cors());

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 100, 
    message: 'Too many requests.',
    standardHeaders: true, 
    legacyHeaders: false,
});
app.use(limiter);

app.use(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    (req as any).rawBody = req.body;
    next();
  },
  webhookRoutes
);

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
app.use('/cron', cronRoutes)
app.use('/currency', currencyRoutes)
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
export default app;