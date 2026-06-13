import { Server, Socket } from "socket.io";
import rooms from "../room-manager"
import { translateText } from "../../services/translator";
import { verifyAccessToken } from "../../utils/jwt";
import Message from "../../models/Message";
import mongoose from "mongoose";

export default function(io: Server, socket: Socket) {
    socket.on("msg_transmit", async ({ room, text, originalLang, token }) => {
        console.log(`${socket.id} emit message to room ${room}`)
        const roomId = socket.data.roomId;
        if(!roomId) return;

        let userId = null;
        let userName = null;
        if(token) {
            try {
                const decoded = await verifyAccessToken(token) as any;
                userId = decoded.id
                userName = decoded.name
            } catch (error) {}
        }

        try {
            const languages = rooms.languages(roomId)
            const translations: Record<string, string> = {};
    
            for(const lang of languages) {
                if (lang === originalLang) {
                    translations[lang] = text;
                } else {
                    translations[lang] = await translateText(text, lang);
                }
            }
    
            if(userId) {
                await Message.create({
                    chatId: room,
                    senderName: userName ? userName : "Guest",
                    originalMsg: text,
                    translations,
                    originalLang,
                    translatedLang: 'multiple',
                    senderId: new mongoose.Types.ObjectId(userId)
                })
            }

            io.to(roomId).emit("new_message", {
                translations,
                senderId: userId ? userId : socket.id,
                timestamp: new Date()
            })
        } catch (error) {
            console.error(error)
            socket.emit('error', "Failed")
        }
    })
}