import { Request, Response } from 'express';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

export const getMyChats = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  
  const chats = await Chat.find({
    $or: [{ senderId: userId }, { receiverId: userId }]
  }).sort({ timestamp: -1 });

  res.status(200).json(new ApiResponse(200, chats, 'Chats fetched successfully'));
});

export const getChatMessages = asyncHandler(async (req: Request, res: Response) => {
  const { chatId } = req.params;
  // @ts-ignore
  const userId = req.user.id;

  const chat = await Chat.findOne({
    chatId,
    $or: [{ senderId: userId }, { receiverId: userId }]
  });

  if (!chat) {
    throw new ApiError(403, 'Not authorized to view this chat');
  }

  const messages = await Message.find({ chatId }).sort({ timestamp: 1 })

  res.status(200).json(new ApiResponse(200, messages, 'Messages fetched successfully'));
});
