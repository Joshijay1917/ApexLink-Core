import { Router } from 'express';
import { signup, login, whoami, refresh } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router: Router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/whoami', authMiddleware, whoami);

export default router;
