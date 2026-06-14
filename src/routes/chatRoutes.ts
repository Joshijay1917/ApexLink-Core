import { Router } from 'express';
import { getMyChats, getChatMessages, joinRoom } from '../controllers/chatController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router: Router = Router();

router.get('/my-chats', authMiddleware, getMyChats);
router.get('/my-chats/:chatId', authMiddleware, getChatMessages);
router.post('/join-room', authMiddleware, joinRoom)

export default router;
