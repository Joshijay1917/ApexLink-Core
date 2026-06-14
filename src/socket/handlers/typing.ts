import { Server, Socket } from "socket.io";

export default function(io: Server, socket: Socket) {
    socket.on("typing_start", ({ name }) => {
        const roomId = socket.data.roomId;
        if(!roomId) return;

        socket.to(roomId).emit("user_typing", {
            userId: socket.id,
            name
        })
    })

    socket.on("typing_stop", () => {
        const roomId = socket.data.roomId;
        if(!roomId) return;

        socket.to(roomId).emit("user_stop_typing", {
            userId: socket.id
        })
    })
}