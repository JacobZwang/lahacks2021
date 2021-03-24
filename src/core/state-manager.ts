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

        socket.on("del:wall", (payload) => {
            this.tileManager.tiles[payload].removeWall();
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
        class Vertex {
            tileId: number;
            distancefromuser: number;
            heuristicdistance: number;
            fvalue: number;
            previous: number;

            constructor(
                tileId: number,
                heuristicdistance: number,
                previous: number
            ) {
                this.tileId = tileId;
                this.distancefromuser = 1;
                this.heuristicdistance = heuristicdistance;
                this.fvalue = this.heuristicdistance + this.distancefromuser;
                this.previous = previous;
            }
        }

        let users = this.userManager.users;

        for (let k of users.keys()) {
            if (k == undefined) users.delete(k);
        }
        if (users != undefined) {
            users.forEach((user) => {
                let openList = [];
                const closedList = [];
                const ledger = [];
                const userx =
                    this.tileManager.tiles.indexOf(user.tileIn) %
                    this.tileManager.width;
                const usery =
                    this.tileManager.tiles.indexOf(user.tileIn) /
                    this.tileManager.width;
                console.log(this.clientUser.tileIn);
                openList.push(this.clientUser.tileIn);
                while (openList.length > 0) {
                    const possibilities = [
                        openList[0].neighborTop,
                        openList[0].neighborBottom,
                        openList[0].neighborRight,
                        openList[0].neighborLeft,
                    ];
                    for (var i = 0; i < possibilities.length; i++) {
                        if (possibilities[i].hasWall != true) {
                            const x =
                                this.tileManager.tiles.indexOf(
                                    possibilities[i]
                                ) % this.tileManager.width;
                            const y =
                                this.tileManager.tiles.indexOf(
                                    possibilities[i]
                                ) / this.tileManager.width;

                            const tileId = this.tileManager.tiles.indexOf(
                                possibilities[i]
                            );
                            const heuristicdistance = Math.sqrt(
                                Math.pow(x - userx, 2) + Math.pow(y - usery, 2)
                            );
                            const previous = this.tileManager.tiles.indexOf(
                                openList[0]
                            );

                            const vertex = new Vertex(
                                tileId,
                                heuristicdistance,
                                previous
                            );

                            ledger.push(vertex);
                        }
                    }
                    ledger.sort((a, b) => {
                        return a.fvalue - b.fvalue;
                    });

                    console.log(ledger[0]);

                    openList = [];
                }
            });
        }
        // return "no possible paths"

        //Initializing the open/closed lists
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

    emitRemoveWall(tile: Tile) {
        this.socket.emit("del:wall", this.tileManager.tiles.indexOf(tile));
    }
}
