import { Room, Client } from "colyseus";
import { GameState, Player } from "./models/game-state";
import { GAME } from "../definitions/constants";

export class GameSession extends Room<GameState> {
  maxClients = 10;
  killCooldowns = new Map<string, number>();
  killCooldownTime = GAME.KILL_COOLDOWN_MS;
  killRange = GAME.KILL_RANGE;

  async onCreate(options: any) {
    this.setState(new GameState());

    let roomName = "Unnamed Room";
    if (options.roomData && options.roomData.roomName) {
      roomName = options.roomData.roomName;
    }

    await this.presence.hset("roomlist", this.roomId, JSON.stringify({
      name: roomName,
      clients: 0,
    }));

    const handleMove = (client: Client, message: any) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.position.x = message.position.x;
        player.position.y = message.position.y;
        player.position.z = message.position.z;
        player.rotation.x = message.rotation.x;
        player.rotation.y = message.rotation.y;
        player.rotation.z = message.rotation.z;
        player.state = message.state;

        this.broadcast("entity_moved", {
          id: client.sessionId,
          position: message.position,
          rotation: message.rotation,
          state: message.state,
        }, { except: client });
      }
    };

    this.onMessage("entity_update", handleMove);
    this.onMessage("entity_moved", handleMove);

    this.onMessage("chat", (client: Client, message: any) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        this.broadcast("chat", {
          name: player.name,
          message: message.message,
          timestamp: Date.now(),
        });
      }
    });

    this.onMessage("action", (client: Client, message: any) => {
      const killerPlayer = this.state.players.get(client.sessionId);
      const victimPlayer = this.state.players.get(message.targetId);

      if (!killerPlayer || !victimPlayer) {
        return;
      }

      if (killerPlayer.role !== "imposter") {
        return;
      }

      if (killerPlayer.isDead === true || victimPlayer.isDead === true) {
        return;
      }

      const lastKillTime = this.killCooldowns.get(client.sessionId);
      const currentTime = Date.now();
      
      if (lastKillTime) {
        const timeSinceKill = currentTime - lastKillTime;
        if (timeSinceKill < this.killCooldownTime) {
          const remaining = Math.ceil((this.killCooldownTime - timeSinceKill) / 1000);
          client.send("action_timer", { remaining: remaining });
          return;
        }
      }

      const dx = killerPlayer.position.x - victimPlayer.position.x;
      const dy = killerPlayer.position.y - victimPlayer.position.y;
      const dz = killerPlayer.position.z - victimPlayer.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance > this.killRange) {
        return;
      }

      victimPlayer.isDead = true;
      this.killCooldowns.set(client.sessionId, currentTime);

      this.broadcast("entity_eliminated", {
        killerId: client.sessionId,
        victimId: message.targetId,
      });

      client.send("killCooldown", { remaining: this.killCooldownTime / 1000 });
    });

    setInterval(() => {
      const playerIds = Array.from(this.state.players.keys());
      
      for (let i = 0; i < playerIds.length; i++) {
        const playerId = playerIds[i];
        const player = this.state.players.get(playerId);
        
        if (player && player.role === "imposter" && !player.isDead) {
          const lastKillTime = this.killCooldowns.get(playerId);
          const currentTime = Date.now();
          let remaining = 0;
          
          if (lastKillTime) {
            const timeSinceKill = currentTime - lastKillTime;
            if (timeSinceKill < this.killCooldownTime) {
              remaining = Math.ceil((this.killCooldownTime - timeSinceKill) / 1000);
            }
          }

          const clientsArray = Array.from(this.clients);
          for (let j = 0; j < clientsArray.length; j++) {
            if (clientsArray[j].sessionId === playerId) {
              clientsArray[j].send("action_timer", { remaining: remaining });
              break;
            }
          }
        }
      }
    }, 1000);
  }

  async onJoin(client: Client, options: any) {
    const player = new Player();
    player.name = options.name || "Player " + (this.state.players.size + 1);
    player.position.x = Math.random() * 10 - 5;
    player.position.y = 1;
    player.position.z = Math.random() * 10 - 5;
    player.state = "idle";
    
    if (this.state.players.size === 0) {
      player.role = "imposter";
    } else {
      player.role = "crewmate";
    }

    this.state.players.set(client.sessionId, player);

    const roomData = await this.presence.hget("roomlist", this.roomId);
    if (roomData) {
      const parsedData = JSON.parse(roomData);
      parsedData.clients = this.clients.length;
      await this.presence.hset("roomlist", this.roomId, JSON.stringify(parsedData));
    }
  }

  async onLeave(client: Client, consented: boolean) {
    this.state.players.delete(client.sessionId);

    const roomData = await this.presence.hget("roomlist", this.roomId);
    if (roomData) {
      const parsedData = JSON.parse(roomData);
      parsedData.clients = this.clients.length;
      await this.presence.hset("roomlist", this.roomId, JSON.stringify(parsedData));
    }
  }

  onDispose() {
    this.presence.hdel("roomlist", this.roomId);
  }
}
