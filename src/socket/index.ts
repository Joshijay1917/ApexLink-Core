import { Server } from "socket.io";
import joinRoom from "./handlers/join-room";
import msgTransmit from "./handlers/msg-transmit";
import rooms from "./room-manager"
import setLanguage from "./handlers/set-language";
import typing from "./handlers/typing";

export default function registerSocket(io: Server) {
    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        joinRoom(io, socket);

        msgTransmit(io, socket);

        setLanguage(io, socket);

        typing(io, socket);

        socket.on("leave_room", ({ room }) => {
            if(!room) return;
            rooms.leave(room, socket.id)
        })

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
        })
    })
}