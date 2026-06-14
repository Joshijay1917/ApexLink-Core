import { Server, Socket } from "socket.io";
import rooms from "../room-manager";
import { verifyAccessToken } from "../../utils/jwt";
import Chat from '../../models/Chat';

export default function(io: Server, socket: Socket) {
    socket.on("join_room", async ({ room, lang, token }) => {
        socket.join(room)
        socket.data.roomId = room;
        let userId = null;

        if(token) {
            try {
                const decoded = await verifyAccessToken(token) as any;
                userId = decoded.id
            } catch (error) {}
        }

        if(userId) {
            const chatExists = await Chat.findOne({ chatId: room })

            if(chatExists && chatExists.senderId.toString() !== userId) {
                chatExists.receiverId = userId;
                await chatExists.save();
            }
        }

        rooms.join(room, {
            socketId: socket.id,
            userId: userId,
            preferredLang: lang
        })
    })
}