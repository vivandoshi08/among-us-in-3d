import { Schema, type, MapSchema } from "@colyseus/schema";

export class Vector3 extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;
}

export class Player extends Schema {
  @type("string") name: string = "";
  @type(Vector3) position = new Vector3();
  @type(Vector3) rotation = new Vector3();
  @type("string") state: string = "idle";
  @type("string") role: string = "crewmate";
  @type("boolean") isDead: boolean = false;
}

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}
