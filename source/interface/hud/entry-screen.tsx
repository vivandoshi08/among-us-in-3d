import React, { useEffect, useState } from "react";
import { useLobby } from "../../network/lobby-provider";
import generateRandomName from "./name-generator";

type RoomId = {
    room_name: string;
    room_id: string | undefined;
};

interface EntryScreenProps {
    on_enter_game: (name: string, room: RoomId) => void;
}

const restricted_names = ["moderator", "administrator", "superuser", "bot", "system_user"];

const EntryScreen: React.FC<EntryScreenProps> = ({ on_enter_game }) => {
    const [player_name, set_player_name] = useState("");
    const [is_editing_name, set_is_editing_name] = useState(false);
    const [error_message, set_error_message] = useState("");
    const [new_room_name, set_new_room_name] = useState("");
    const [is_creating_room, set_is_creating_room] = useState(false);
    const [search_query, set_search_query] = useState("");
    const { rooms, client } = useLobby();

    useEffect(() => {
        let stored_name = localStorage.getItem("playerName");
        if (!stored_name) {
            stored_name = generateRandomName();
            localStorage.setItem("playerName", stored_name);
        }
        set_player_name(stored_name);
    }, []);

    const handle_name_submit = () => {
        const trimmedName = player_name.trim();
        
        if (restricted_names.includes(trimmedName.toLowerCase())) {
            set_error_message("This name is not allowed.");
            return;
        }
        
        if (trimmedName === "") {
            const random_name = generateRandomName();
            set_player_name(random_name);
            localStorage.setItem("playerName", random_name);
        } else {
            localStorage.setItem("playerName", trimmedName);
        }
        
        set_error_message("");
        set_is_editing_name(false);
    };

    const join_room = (room: { room_id: string; name: string; clients: number }) => {
        if (!client) return;
        on_enter_game(player_name, { room_name: room.name, room_id: room.room_id });
    };

    const create_room = () => {
        const roomName = new_room_name.trim();
        if (roomName.length === 0) {
            set_error_message("Room name cannot be empty.");
            return;
        }
        if (roomName.length > 30) {
            set_error_message("Room name too long.");
            return;
        }
        set_error_message("");
        on_enter_game(player_name, { room_name: roomName, room_id: undefined });
        set_is_creating_room(false);
        set_new_room_name("");
    };

    const filtered_rooms = rooms.filter((room) =>
        room.name.toLowerCase().includes(search_query.toLowerCase())
    );

    return (
        <div className="entry-screen">
            <div className="name-wrapper">
                <div className="name-input-area">
                    <span className="edit-prompt" onClick={() => set_is_editing_name(!is_editing_name)}>
                        ✎
                    </span>
                    {is_editing_name ? (
                        <input
                            type="text"
                            value={player_name}
                            onChange={(e) => set_player_name(e.target.value)}
                            onBlur={handle_name_submit}
                            className="name-input-field"
                            placeholder="Enter your name..."
                            autoFocus
                        />
                    ) : (
                        <span className="name-display-text">{player_name}</span>
                    )}
                </div>
                {error_message && !is_creating_room && <div className="error-message">{error_message}</div>}
            </div>

            <div className="session-list">
                <div className="session-list-header">
                    <button onClick={() => set_is_creating_room(true)} className="create-session-button">
                        +
                    </button>
                    <h3>Available Rooms</h3>
                    <input
                        type="text"
                        value={search_query}
                        onChange={(e) => set_search_query(e.target.value)}
                        placeholder="Search rooms..."
                        className="search-field"
                    />
                </div>

                {is_creating_room && (
                    <div className="overlay">
                        <div className="overlay-content">
                            <h3>Create a New Room</h3>
                            <input
                                type="text"
                                value={new_room_name}
                                onChange={(e) => set_new_room_name(e.target.value)}
                                placeholder="Enter room name..."
                                className="entry-input-field"
                            />
                            {error_message && <div className="error-message">{error_message}</div>}
                            <div className="overlay-buttons">
                                <button onClick={create_room} className="confirm-button">
                                    Create
                                </button>
                                <button onClick={() => { set_is_creating_room(false); set_error_message("") }} className="cancel-button">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <table className="session-table">
                    <thead>
                        <tr>
                            <th>Room Name</th>
                            <th>Players</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    {filtered_rooms.length > 0 && (
                        <tbody>
                            {filtered_rooms.map((room: any) => (
                                <tr key={room.room_id} className="session-row">
                                    <td>{room.name}</td>
                                    <td>{room.clients}</td>
                                    <td>
                                        <button className="join-session-button" onClick={() => join_room(room)}>
                                            Join
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
                {filtered_rooms.length === 0 &&
                    <div className="no-sessions-message">
                        No rooms available. Create a new one!
                    </div>
                }
            </div>
        </div>
    );
};

export default EntryScreen;