import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Client, Room } from "colyseus.js";
import { useRoomData } from "../state/global-state";

interface RoomContextProps {
    room: Room | null;
}

const RoomContext = createContext<RoomContextProps | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [room, set_room] = useState<Room | null>(null);
    const { room_data } = useRoomData();
    const client = useRef<Client | null>(null);

    useEffect(() => {
        if (room_data.room_id) {
            const player_name = localStorage.getItem("playerName") || "Guest";
            const serverUrl = "ws://localhost:2567";
            client.current = new Client(serverUrl);

            client.current.joinById(room_data.room_id, { name: player_name, role: "player", roomData: room_data }).then((joined_room: any) => {
                set_room(joined_room);

                joined_room.state.players.onAdd((player: any, key: any) => {
                });

                joined_room.state.players.onRemove((player: any, key: any) => {
                });

                joined_room.onMessage("entity_moved", (data: any) => {
                });

                joined_room.onMessage("chat", (data: any) => {
                });
            });

        } else {

            const player_name = localStorage.getItem("playerName") || "Guest";
            const serverUrl = "ws://localhost:2567";
            client.current = new Client(serverUrl);
            client.current.joinOrCreate("game_session", { name: player_name, role: "player", roomData: room_data }).then((joined_room: any) => {
                set_room(joined_room);

                joined_room.state.players.onAdd((player: any, key: any) => {
                });

                joined_room.state.players.onRemove((player: any, key: any) => {
                });

                joined_room.onMessage("entity_moved", (data: any) => {
                });

                joined_room.onMessage("chat", (data: any) => {
                });
            });
        }

        return () => {
            if (room) room.leave();
        };
    }, []);

    return (
        <RoomContext.Provider value={{ room }}>
            {children}
        </RoomContext.Provider>
    );
};

export const useRoom = () => {
    const context = useContext(RoomContext);
    if (context === undefined) {
        throw new Error("useRoom must be used within a SessionProvider");
    }
    return context;
};
