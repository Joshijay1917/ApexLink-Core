import { Router } from 'express';
import { createPaymentIntent, verifyPayment } from '../controllers/paymentController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/multerMiddleware';

const router: Router = Router();

router.post('/create', authMiddleware, createPaymentIntent);
router.post('/verify', authMiddleware, upload.single('screenshot'), verifyPayment);

export default router;
