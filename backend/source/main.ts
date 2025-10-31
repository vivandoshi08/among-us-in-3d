import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import { monitor } from "@colyseus/monitor";

import { GameSession } from "./sessions/game-session";
import { LobbySession } from "./sessions/lobby-session";

const port = 2567;
const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

const gameServer = new Server({
  server: server,
});

gameServer.define("game_session", GameSession);
gameServer.define("lobby_session", LobbySession);

app.use("/colyseus", monitor());

gameServer.listen(port);
console.log("server started on port " + port);
