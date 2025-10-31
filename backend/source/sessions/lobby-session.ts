import { Room, Client } from "colyseus";

export class LobbySession extends Room {
  roomListInterval: any;
  lastRoomCount: number = 0;

  onCreate(options: any) {
    this.roomListInterval = setInterval(async () => {
      const currentRooms = await this.presence.hgetall("roomlist");
      const roomIds = Object.keys(currentRooms);
      const roomCount = roomIds.length;

      if (roomCount !== this.lastRoomCount) {
        const roomsArray = [];
        
        for (let i = 0; i < roomIds.length; i++) {
          const roomId = roomIds[i];
          const details = currentRooms[roomId];
          const parsedDetails = JSON.parse(details);
          
          roomsArray.push({
            room_id: roomId,
            name: parsedDetails.name,
            clients: parsedDetails.clients,
          });
        }

        this.broadcast("rooms", roomsArray);
        this.lastRoomCount = roomCount;
      }
    }, 1500);
  }

  async onJoin(client: Client, options: any) {
    const rooms = await this.presence.hgetall("roomlist");
    const roomIds = Object.keys(rooms);
    const roomsArray = [];
    
    for (let i = 0; i < roomIds.length; i++) {
      const roomId = roomIds[i];
      const details = rooms[roomId];
      const parsedDetails = JSON.parse(details);
      
      roomsArray.push({
        room_id: roomId,
        name: parsedDetails.name,
        clients: parsedDetails.clients,
      });
    }

    client.send("rooms", roomsArray);
  }

  onLeave(client: Client, consented: boolean) {
  }

  onDispose() {
    if (this.roomListInterval) {
      clearInterval(this.roomListInterval);
    }
  }
}
