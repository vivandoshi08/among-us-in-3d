import React, { createContext, useContext, useEffect, useState } from "react";
import { Client } from "colyseus.js";

type Room = {
    room_id: string;
    name: string;
    clients: number;
};

type LobbyContextType = {
    rooms: Room[];
    client: Client | null;
};

const LobbyContext = createContext<LobbyContextType>({
    rooms: [],
    client: null,
});

export const useLobby = () => useContext(LobbyContext);

export const LobbyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [rooms, set_rooms] = useState<Room[]>([]);
    const [client, set_client] = useState<Client | null>(null);

    useEffect(() => {
        const SERVER_URL = "ws://localhost:2567";
        const colyseusClient = new Client(SERVER_URL);
        set_client(colyseusClient);

        let lobby_room: any = null;

        colyseusClient.joinOrCreate("lobby_handler").then((lobby) => {
            lobby_room = lobby;
            console.log("connected to lobby, session id:", lobby.sessionId);

            lobby.onMessage("rooms", (received_rooms: Room[]) => {
                if (received_rooms && Array.isArray(received_rooms)) {
                    console.log("got rooms:", received_rooms.length);
                    set_rooms(received_rooms);
                } else {
                    console.log("received invalid rooms data");
                    set_rooms([]);
                }
            });

            lobby.onMessage("*", (type, message) => {
                console.log(`received message type: "${type}"`, message);
            });

            lobby.onMessage("+", ([room_id, details]: [string, Room]) => {
                set_rooms((prevRooms) => {
                    const roomExists = prevRooms.find(r => r.room_id === room_id);
                    if (!roomExists) {
                        const newRoom = { 
                            room_id: details.room_id, 
                            name: details.name, 
                            clients: details.clients 
                        };
                        return [...prevRooms, newRoom];
                    }
                    return prevRooms;
                });
            });

            lobby.onMessage("-", (room_id: string) => {
                set_rooms(prevRooms => {
                    return prevRooms.filter(room => room.room_id !== room_id);
                });
            });
        }).catch((error) => {
            console.error("error joining lobby:", error);
        });

        return () => {
            if (lobby_room) {
                console.log("disconnecting from lobby");
                lobby_room.leave();
            }
        };
    }, []);

    return (
        <LobbyContext.Provider value={{ rooms, client }}>
            {children}
        </LobbyContext.Provider>
    );
};