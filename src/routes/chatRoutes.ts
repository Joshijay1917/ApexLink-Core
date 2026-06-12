import { Router } from 'express';
import { getMyChats, getChatMessages } from '../controllers/chatController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router: Router = Router();

router.get('/my-chats', authMiddleware, getMyChats);
router.get('/my-chats/:chatId', authMiddleware, getChatMessages);

export default router;
