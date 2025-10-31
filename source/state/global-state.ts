import create from "zustand";

interface EnergyState {
    current_energy: number;
    update_energy: (value: number) => void;
}

export const useStamina = create<EnergyState>((set) => ({
    current_energy: 100,
    update_energy: (value: number) => set(() => ({ current_energy: value })),
}));

interface RoomState {
    room_data: {
        room_name: string | undefined;
        room_id: string | undefined;
    };
    set_room_data: (name: string, id: string | undefined) => void;
}

export const useRoomData = create<RoomState>((set) => ({
    room_data: {
        room_name: undefined,
        room_id: undefined,
    },
    set_room_data: (name: string, id: string | undefined) => set(() => ({ room_data: { room_name: name, room_id: id } })),
}));