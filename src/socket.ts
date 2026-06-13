import { Server } from 'socket.io';

import { translateText } from './services/translator';
import Message from './models/Message';
import Chat from './models/Chat';
import { verifyAccessToken } from './utils/jwt';
import mongoose from 'mongoose';
import { ApiError } from './utils/ApiError';

const roomLanguages: Record<string, Set<string>> = {};
const roomParticipants: Record<string, Set<string>> = {};

export default function registerSocket(io: Server) {
  
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  socket.on('join_room', async (data) => {
    const { room, lang, token } = data;
    socket.join(room);
    if (!roomLanguages[room]) roomLanguages[room] = new Set();
    roomLanguages[room].add(lang);
    
    if (token) {
       try {
          const decoded = await verifyAccessToken(token) as any;
          if (decoded && decoded.id) {
             if (!roomParticipants[room]) roomParticipants[room] = new Set();
             roomParticipants[room].add(decoded.id);
          }
       } catch (err) {}
    }
    console.log(`Socket ${socket.id} joined room: ${room} with lang: ${lang}`);
  });

  socket.on('set_language', (data) => {
    const { room, lang } = data;
    if (!roomLanguages[room]) roomLanguages[room] = new Set();
    roomLanguages[room].add(lang);
  });

  socket.on('msg_transmit', async (data) => {
    const { room, text, originalLang, token } = data;
    
    const activeLangs = Array.from(roomLanguages[room] || ['en']);
    const translations: Record<string, string> = {};
    
    await Promise.all(activeLangs.map(async (lang) => {
       if (lang === originalLang) {
          translations[lang] = text;
       } else {
          translations[lang] = await translateText(text, lang);
       }
    }));
    
    let senderId = socket.id;
    if (token) {
      try {
        const decoded = await verifyAccessToken(token) as any;
        if (decoded && decoded.id) {
          senderId = decoded.id;
          
          let chatExists = await Chat.findOne({ chatId: room });

          if (!chatExists && roomParticipants[room]) {
             const parts = Array.from(roomParticipants[room]);
             const otherId = parts.find(id => id !== decoded.id) || parts[0];
             chatExists = await Chat.create({
                chatId: room,
                senderId: new mongoose.Types.ObjectId(decoded.id),
                receiverId: new mongoose.Types.ObjectId(otherId)
             });
          } else if(chatExists && roomParticipants[room] && roomParticipants[room].size >= 2) {
              const parts = Array.from(roomParticipants[room]);
              const otherId = parts.find(id => id !== decoded.id) || parts[0];
              chatExists.receiverId = new mongoose.Types.ObjectId(otherId);
              await chatExists.save();
          }

          // Only save message if the Chat workspace exists
          // if (chatExists) {
             await Message.create({
                chatId: room,
                senderName: decoded?.name ? decoded.name : room,
                originalMsg: text,
                translations,
                originalLang,
                translatedLang: 'multiple',
                senderId: new mongoose.Types.ObjectId(decoded.id)
             });
          // }
        }
      } catch (err: any) {
        console.error('Socket auth failed', err);
        if(err?.message === "jwt expired") {
          throw new ApiError(401, "Unauthorized access!")
        }
        throw new ApiError(500, 'Something went wrong!')
      }
    }

    io.to(room).emit('new_message', {
      translations,
      senderId,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
})
}