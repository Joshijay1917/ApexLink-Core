import { Server, Socket } from "socket.io";
import rooms from "../room-manager"

export default function(io: Server, socket: Socket) {
    socket.on("set_language", ({ room, lang }) => {
        const roomId = socket.data.roomId
        if(!roomId) return;

        rooms.setLanguage(roomId, socket.id, lang)
    })
}