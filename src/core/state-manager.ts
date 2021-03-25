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
    leftMousedown: boolean;

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
        this.leftMousedown = false;

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

        document.addEventListener("mousedown", (e) => {
            if (e.button === 2) {
                this.leftMousedown = true;

                function mouseup() {
                    this.leftMousedown = false;
                    document.removeEventListener("mouseup", mouseup);
                }

                document.addEventListener("mouseup", mouseup);
            }
        });

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
            tile: Tile;
            previousTile: Vertex;

            constructor(
                tileId: number,
                heuristicdistance: number,
                tile: Tile,
                previousTile: Vertex
            ) {
                this.tileId = tileId;
                this.distancefromuser =
                    this.previousTile != null
                        ? this.previousTile.distancefromuser + 1
                        : 0;
                this.heuristicdistance = heuristicdistance;
                this.fvalue = this.heuristicdistance + this.distancefromuser;
                this.tile = tile;
                this.previousTile = previousTile;
            }
        }

        let users = this.userManager.users;

        for (let k of users.keys()) {
            if (k == undefined) users.delete(k);
        }

        if (users != undefined) {
            users.forEach((user) => {
                let openList: Array<Vertex> = [];
                const closedList: Array<Vertex> = [];

                const userx =
                    this.tileManager.tiles.indexOf(user.tileIn) %
                    this.tileManager.width;
                const usery =
                    this.tileManager.tiles.indexOf(user.tileIn) /
                    this.tileManager.width;
                let origon = new Vertex(
                    this.tileManager.tiles.indexOf(this.clientUser.tileIn),
                    0,
                    this.clientUser.tileIn,
                    null
                );
                openList.push(origon);
                while (openList != []) {
                    const possibilities = [
                        openList[0].tile.neighborTop,
                        openList[0].tile.neighborBottom,
                        openList[0].tile.neighborRight,
                        openList[0].tile.neighborLeft,
                    ];
                    const childNodes: Array<Vertex> = [];

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

                            const tile = possibilities[i];
                            
                            closedList.push(openList[0]);
                            openList.shift();

                            const previousTile = closedList.slice(-1)[0];

                            // console.log(previousTile)


                            const vertex = new Vertex(
                                tileId,
                                heuristicdistance,
                                tile,
                                previousTile
                            );

                            childNodes.push(vertex);
                        }
                    }

                    childNodes.sort((a, b) => {
                        return a.fvalue - b.fvalue;
                    });
                    
                    for(var i = 0; i < childNodes.length; i++){
                        if (
                            Math.floor(childNodes[i].heuristicdistance) <= 1
                        ) {
                             console.log(childNodes[i]);
                             console.log(openList)
                             console.log(closedList)
                             openList = []
                             break
                        } else if (openList.includes(childNodes[i])) {
                            if (
                                openList[openList.indexOf(childNodes[i])].fvalue <
                                childNodes[i].fvalue
                            ) {
                                openList.splice(openList.indexOf(childNodes[i]), 1);
                            }
                        } else if (closedList.includes(childNodes[i])) {
                            if (
                                closedList[closedList.indexOf(childNodes[i])].fvalue <
                                childNodes[i].fvalue
                            ) {
                                closedList.splice(closedList.indexOf(childNodes[i]), 1);
                            }
                        } else {
                            openList.push(childNodes[i]);
                        }
                    }
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
