import { Server } from "socket.io";
import joinRoom from "./handlers/join-room";
import msgTransmit from "./handlers/msg-transmit";
import rooms from "./room-manager"
import setLanguage from "./handlers/set-language";

export default function registerSocket(io: Server) {
    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        joinRoom(io, socket);

        msgTransmit(io, socket);

        setLanguage(io, socket);

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
            rooms.leave(socket.data.roomId, socket.id)
        })
    })
}