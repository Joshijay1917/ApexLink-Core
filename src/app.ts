import express, { type Express } from "express"
import cors from 'cors';
import helmet from 'helmet';
import { apiLimiter } from './middlewares/rateLimiter';

const app: Express = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiLimiter);

import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import paymentRoutes from './routes/paymentRoutes';

// Setup Basic Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/', (req, res) => {
  res.send('ApexLink API is running...');
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app