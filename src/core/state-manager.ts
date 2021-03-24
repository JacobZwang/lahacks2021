import TileManager from "./tile-manager";
import type User from "./user";
import UserManager from "./user-manager";
import type Tile from "./tile";
import type { Socket } from "socket.io-client";
import RTCManager from "./rtc-manager";

export default class StateManager {
    userManager: UserManager;
    tileManager: TileManager;
    clientUser: User;
    socket: Socket;
    video: HTMLVideoElement;
    RTCManager: RTCManager;

    constructor(width: number, height: number, socket: Socket) {
        const self = this;
        this.userManager = new UserManager(self);
        this.tileManager = new TileManager(
            self,
            document.getElementById("grid") as HTMLDivElement,
            width,
            height
        );
        this.socket = socket;
        this.RTCManager = new RTCManager(socket);

        for (let i = 0; i < width * height; i++) {
            const tile = this.tileManager.createTile();
            // tile.outline();
        }

        this.tileManager.tiles.forEach((tile, i) => {
            tile.assignNeighbors(
                this.tileManager.tiles[i - width],
                this.tileManager.tiles[i + 1],
                this.tileManager.tiles[i + width],
                this.tileManager.tiles[i - 1]
            );
        });

        this.clientUser = this.userManager.createUser({ id: this.socket.id });
        this.userManager.setActiveUser(this.clientUser);

        socket.on("set:walls", (payload) => {
            this.tileManager.tiles.forEach((_, i) => {
                const tile = this.tileManager.tiles[i];

                if (payload.some((j: number) => j === i)) {
                    tile.addWallAndRecalc();
                }
            });
        });

        socket.on("set:user", (payload) => {
            this.userManager.setUser(payload);
        });

        socket.on("del:user", (payload) => {
            this.userManager.deleteUser(payload.id);
        });

        socket.on("set:wall", (payload) => {
            this.tileManager.tiles[payload].addWallAndRecalc();
        });
    }

    getWallsAsJSON() {
        const walls: number[] = [];
        this.tileManager.tiles.forEach((tile, i) => {
            if (tile.hasWall) {
                walls.push(i);
            }
        });
        return walls.toString();
    }

    /**calculates the distances all uses are away from the client user*/
    calculateDistancesFromClient() {
        const origin = this.clientUser;
        const tiles = this.tileManager.tiles;

        tiles.forEach((tile: Tile) => {
            // console.log({
            //     hasWall: tile.hasWall,
            //     hasUser: tile.hasUser,
            //     user: tile.user,
            // });
        });
    }

    emitUser(user: User) {
        this.socket.emit("set:user", {
            id: this.socket.id,
            location: this.tileManager.tiles.indexOf(user.tileIn),
        });
    }

    emitWall(tile: Tile) {
        this.socket.emit("set:wall", this.tileManager.tiles.indexOf(tile));
    }
}
