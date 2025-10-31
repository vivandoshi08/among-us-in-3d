import React, { useState } from "react";

import SceneManager from "./core/scene-manager";
import AssetLoader from "./bootstrap/asset-loader";
import InterfaceManager from "./interface/interface-manager";
import EntryScreen from "./interface/hud/entry-screen";

import { SessionProvider } from "./network/session-provider";
import { useRoomData } from "./state/global-state";
import { LobbyProvider } from "./network/lobby-provider";

const Application: React.FC = () => {
  const [player_name, set_player_name] = useState<string | null>(null);
  const { room_data, set_room_data } = useRoomData();

  type Room = {
    room_name: string;
    room_id: string | undefined;
  };

  const handle_enter_game = (name: string, room: Room) => {
    set_player_name(name);
    set_room_data(room.room_name, room.room_id);
  };

  return (
    <>
      {player_name && room_data ? (
        <SessionProvider>
          <AssetLoader />
          <InterfaceManager />
          <SceneManager />
        </SessionProvider>
      ) : (
        <LobbyProvider>
          <EntryScreen on_enter_game={handle_enter_game} />
        </LobbyProvider>
      )}
    </>
  );
};

export default Application;
