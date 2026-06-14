import { Request, Response } from 'express';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import User from '../models/User';

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

  if(!chatId || !userId) {
    throw new ApiError(400, "Required fields not found!")
  }

  const chat = await Chat.findOne({
    chatId,
    $or: [{ senderId: userId }, { receiverId: userId }]
  });

  if (!chat) {
    throw new ApiError(403, 'Not authorized to view this chat');
  }

  const messages = await Message.find({ chatId }).sort({ createdAt: 1 })

  res.status(200).json(new ApiResponse(200, messages, 'Messages fetched successfully'));
});

export const joinRoom = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.id;
  const { room } = req.body;
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) throw new ApiError(404, 'User not found');

  const chatExists = await Chat.findOne({ chatId: room })
  if(chatExists) {
    throw new ApiError(400, 'Chat room already exists!')
  }

  const chatRoom = await Chat.create({
      chatId: room,
      senderId: userId,
      receiverId: userId
  })

  res.status(201).json(new ApiResponse(201, chatRoom, 'Chatroom created successfully!'));
})