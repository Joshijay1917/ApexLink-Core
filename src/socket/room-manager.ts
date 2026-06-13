type Participant = {
  socketId: string;
  userId?: string;
  preferredLang: string;
};

class RoomManager {
    private rooms = new Map<string, Map<string, Participant>>();

    join(roomId: string, participant: Participant) {
        if(!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Map());
        }

        this.rooms.get(roomId)!.set(participant.socketId, participant);
    }

    leave(roomId: string, socketId: string) {
        const room = this.rooms.get(roomId);

        if(!room) return;

        room.delete(socketId);

        if(room.size === 0) {
            this.rooms.delete(roomId);
        }
    }

    setLanguage(roomId: string, socketId: string, language: string) {
        const room = this.rooms.get(roomId);
        if(!room) return;

        const participant = room.get(socketId)
        if(!participant) return;

        participant.preferredLang = language;
    }

    languages(roomId: string) {
        const room = this.rooms.get(roomId);
        const setOfLanguages = new Set<string>();
        const participants = Array.from(room?.values() || [])

        participants.map(p => setOfLanguages.add(p.preferredLang))

        return Array.from(setOfLanguages);
    }
}

export default new RoomManager();