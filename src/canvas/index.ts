import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

export namespace World {
    export class Model {
        tiles: Map<string, Tile.Model>;
        gridHeight: number;
        gridWidth: number;
        controller: ClientWorldController;

        constructor(
            controller: ClientWorldController,
            gridHeight: number,
            gridWidth: number
        ) {
            this.gridHeight = gridHeight;
            this.gridWidth = gridWidth;
            this.tiles = new Map();
            this.controller = controller;

            new Array(this.gridWidth).fill("").forEach((_, x) => {
                new Array(this.gridHeight).fill("").forEach((_, y) => {
                    this.tiles.set(`${x}:${y}`, new Tile.Model(x, y, this));
                });
            });

            this.controller.controller.onWalls((payload) => {
                payload.forEach((tileId) => {
                    this.tiles.get(tileId).hasWall = true;
                    controller.view.renderFrame();
                });
            });

            this.controller.controller.onWall((payload) => {
                this.tiles.get(payload).hasWall = true;
                controller.view.renderFrame();
            });

            this.controller.controller.onDelWall((payload) => {
                this.tiles.get(payload).hasWall = false;
                controller.view.renderFrame();
            });

            this.controller.controller.onUserNew((user) => {});

            this.controller.controller.onUserMove((payload) => {
                this.tiles.get(
                    `${payload.location.x}:${payload.location.y}`
                ).hasUser = true;
            });
        }
    }

    export class ViewModel {
        viewWidth: number;
        viewHeight: number;
        viewX: number;
        viewY: number;
        viewZ: number;
        view: View;
        tiles: Set<Tile.ViewModel>;
        model: Model;
        controller: ClientWorldController;

        constructor(controller: ClientWorldController) {
            this.viewHeight = window?.innerHeight ?? 1080;
            this.viewWidth = window?.innerWidth ?? 1920;
            this.viewX = 0;
            this.viewY = 0;
            this.viewZ = 1;
            this.controller = controller;
            this.tiles = new Set();

            this.controller.model.tiles.forEach((tile) => {
                this.tiles.add(new Tile.ViewModel(tile, this));
            });
        }

        transformX(x: number) {
            return (
                ((x * this.utilZ(this.viewZ) + this.viewWidth) >> 1) +
                ((this.viewX * this.viewHeight) /
                    this.controller.model.gridHeight) *
                    this.viewZ
            );
        }

        transformY(y: number) {
            return (
                ((-y * this.utilZ(this.viewZ) + this.viewHeight) >> 1) -
                ((this.viewY * this.viewHeight) /
                    this.controller.model.gridHeight) *
                    this.viewZ
            );
        }

        private utilZ(z: number) {
            return (z * this.viewHeight) / this.controller.model.gridHeight;
        }

        transformZ(z: number) {
            return (
                ((z * this.viewHeight) / this.controller.model.gridHeight) *
                this.viewZ
            );
        }

        toUnitX(x: number) {
            return (
                ((((x - this.viewWidth) >> 1) / this.viewWidth) *
                    this.controller.model.gridHeight) /
                this.viewZ
            );
        }

        toUnitY(y: number) {
            return (
                ((((-y + this.viewHeight) >> 1) / this.viewHeight) *
                    this.controller.model.gridHeight) /
                this.viewZ
            );
        }

        moveViewX(movementX: number, render: boolean = true) {
            this.viewX =
                this.viewX +
                (movementX / this.viewHeight / this.viewZ) *
                    this.controller.model.gridHeight;

            if (render) this.controller.view.renderFrame();
        }

        moveViewY(movementY: number, render: boolean = true) {
            this.viewY =
                this.viewY +
                (-movementY / this.viewHeight / this.viewZ) *
                    this.controller.model.gridHeight;

            if (render) this.controller.view.renderFrame();
        }

        moveViewZ(deltaY: number, render: boolean = true) {
            this.viewZ = this.viewZ - (deltaY * this.viewZ) / 1000;

            if (render) this.controller.view.renderFrame();
        }

        moveView(movementX: number, movementY: number) {
            this.moveViewX(movementX, false);
            this.moveViewY(movementY, false);
            this.controller.view.renderFrame();
        }
    }

    export class View {
        tiles: Set<Tile.View>;
        controller: ClientWorldController;
        canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
        middleDown: boolean;
        leftDown: boolean;
        rightDown: boolean;

        constructor(controller: ClientWorldController) {
            this.tiles = new Set();
            this.controller = controller;
            this.canvas = document.getElementById(
                "canvas"
            ) as HTMLCanvasElement;
            this.ctx = this.canvas.getContext("2d");
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            this.controller.viewModel.tiles.forEach((tile) => {
                this.tiles.add(new Tile.View(tile, this));
            });

            this.renderFrame();

            this.middleDown = false;
            this.leftDown = false;
            this.rightDown = false;

            this.canvas.addEventListener("click", (e) => {
                this.controller.controller.
            });

            this.canvas.addEventListener("mousedown", (e) => {
                e.preventDefault();
                if (e.button === 1) {
                    this.middleDown = true;
                } else if (e.button === 2) {
                    this.tiles.forEach((tile) => {
                        if (tile.isOver(e.x, e.y)) {
                            if (tile.viewModel.model.hasWall) {
                                this.controller.controller.emitDelWall(
                                    `${tile.viewModel.model.x}:${tile.viewModel.model.y}`
                                );
                            } else {
                                this.controller.controller.emitWall(
                                    `${tile.viewModel.model.x}:${tile.viewModel.model.y}`
                                );
                            }
                        }
                    });

                    this.rightDown = true;
                }
            });

            this.canvas.addEventListener("mouseup", (e) => {
                if (e.button === 1) {
                    this.middleDown = false;
                } else if (e.button === 2) {
                    this.rightDown = false;
                }
            });

            this.canvas.addEventListener("mousemove", (e) => {
                if (this.middleDown === true) {
                    this.controller.viewModel.moveView(
                        e.movementX,
                        e.movementY
                    );
                }

                this.tiles.forEach((tile) => {
                    if (tile.isOver(e.x, e.y)) {
                        tile.highlightOnFrame();

                        if (this.rightDown) {
                            this.controller.controller.emitWall(
                                `${tile.viewModel.model.x}:${tile.viewModel.model.y}`
                            );
                        }
                    } else {
                        tile.render();
                    }
                });
            });

            this.canvas.addEventListener("wheel", (e) => {
                e.preventDefault();
                this.controller.viewModel.moveViewZ(e.deltaY);
                console.log(
                    this.controller.viewModel.viewX,
                    this.controller.viewModel.viewY,
                    this.controller.viewModel.viewZ
                );

                this.tiles.forEach((tile) => {
                    if (tile.isOver(e.x, e.y)) {
                        tile.highlightOnFrame();
                    } else {
                        tile.render();
                    }
                });
            });
        }

        renderFrame() {
            this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            this.tiles.forEach((tile) => {
                tile.render();
            });
        }
    }
}

export namespace Tile {
    export class Model {
        x: number;
        y: number;
        hasWall: boolean;
        hasUser: boolean;

        constructor(x: number, y: number, parent: World.Model) {
            this.x = x;
            this.y = y;
            this.hasWall = false;
            this.hasUser = false;
        }
    }

    export class ViewModel {
        model: Tile.Model;
        parent: World.ViewModel;

        constructor(model: Tile.Model, parent: World.ViewModel) {
            this.model = model;
            this.parent = parent;
        }

        get x() {
            return this.parent.transformX(
                this.model.x - (this.parent.controller.model.gridWidth >> 1)
            );
        }

        get y() {
            return this.parent.transformY(
                this.model.y - (this.parent.controller.model.gridHeight >> 1)
            );
        }

        get height() {
            return this.parent.transformZ(0.5);
        }

        get width() {
            return this.parent.transformZ(0.5);
        }
    }

    export class View {
        viewModel: Tile.ViewModel;
        parent: World.View;
        isHighlighted: boolean;

        constructor(viewModel: Tile.ViewModel, parent: World.View) {
            this.viewModel = viewModel;
            this.parent = parent;
        }

        render() {
            const ctx = this.parent.ctx;

            ctx.clearRect(
                this.viewModel.x - (this.viewModel.width >> 1),
                this.viewModel.y - (this.viewModel.height >> 1),
                this.viewModel.width,
                this.viewModel.height
            );

            if (this.viewModel.model.hasWall) {
                ctx.beginPath();
                ctx.fillStyle = "black";
                ctx.rect(
                    this.viewModel.x - (this.viewModel.width >> 1),
                    this.viewModel.y - (this.viewModel.height >> 1),
                    this.viewModel.width,
                    this.viewModel.height
                );
                ctx.fill();
                ctx.closePath();
            }

            if (this.isHighlighted) {
                ctx.beginPath();
                ctx.rect(
                    this.viewModel.x - (this.viewModel.width >> 1) - 1,
                    this.viewModel.y - (this.viewModel.height >> 1) - 1,
                    this.viewModel.width,
                    this.viewModel.height
                );
                ctx.fillStyle = "lightgrey";
                ctx.fill();
                ctx.closePath();
            }
            // ctx.stroke();
        }

        isOver(x: number, y: number) {
            return (
                x < this.viewModel.x + (this.viewModel.width >> 1) &&
                x > this.viewModel.x - (this.viewModel.width >> 1) &&
                y < this.viewModel.y + (this.viewModel.height >> 1) &&
                y > this.viewModel.y - (this.viewModel.height >> 1)
            );
        }

        highlight() {
            this.isHighlighted = true;
            this.render();
        }

        highlightOnFrame() {
            this.isHighlighted = true;
            this.render();
            this.isHighlighted = false;
        }
    }
}

export type Coordinate = {
    x: number;
    y: number;
};

export type UserPayload = {
    publicSessionId: string;
    displayName?: string;
    location?: Coordinate;
};

export class User {
    location: Coordinate;
    displayName: string;
    publicSessionId: string;

    constructor(
        publicSessionId: string,
        displayName: string,
        location?: Coordinate
    ) {
        this.location = undefined;
        this.displayName = displayName;
    }

    static fromPayload(payload: {
        publicSessionId: string;
        displayName?: string;
    }) {
        return new User(
            payload.publicSessionId,
            payload.displayName ?? "Unnamed"
        );
    }
}

export class ClientWorldController {
    model: World.Model;
    viewModel: World.ViewModel;
    view: World.View;
    controller: ClientController;

    constructor(controller: ClientController) {
        this.controller = controller;
        this.model = new World.Model(this, 30, 60);
        this.viewModel = new World.ViewModel(this);
        this.view = new World.View(this);
    }
}

class ClientController {
    socket: Socket;
    users: Map<string, User>;
    world: ClientWorldController;

    constructor(io: Socket) {
        this.socket = io;
        this.world = new ClientWorldController(this);
        this.users = new Map();
    }

    onUserNew(callback: (user: User, payload?: UserPayload) => void) {
        this.socket.on("set:user", (payload: UserPayload) => {
            this.users.set(payload.publicSessionId, User.fromPayload(payload));
            callback(this.users.get(payload.publicSessionId));
        });
    }

    onUserSet(callback: (user: User, payload?: UserPayload) => void) {
        this.socket.on("set:user", (payload: UserPayload) => {
            if (!this.users.get(payload.publicSessionId)) {
                this.users.set(
                    payload.publicSessionId,
                    User.fromPayload(payload)
                );
                callback(this.users.get(payload.publicSessionId));
            }
        });
    }

    onUserMove(callback: (user: User, payload?: UserPayload) => void) {
        this.socket.on("set:user", (payload: UserPayload) => {
            if (this.users.get(payload.publicSessionId)) {
                this.users.set(
                    payload.publicSessionId,
                    User.fromPayload(payload)
                );
                callback(this.users.get(payload.publicSessionId));
            }
        });
    }

    onUserStatus(callback: (user: User, payload?: UserPayload) => void) {
        this.socket.on("set:user", (payload: UserPayload) => {
            this.users.set(payload.publicSessionId, User.fromPayload(payload));
            callback(this.users.get(payload.publicSessionId));
        });
    }

    onUserLeave(
        callback: (publicSessionId: string, payload?: UserPayload) => void
    ) {
        this.socket.on("del:user", (payload: UserPayload) => {
            this.users.delete(payload.publicSessionId);
            callback(payload.publicSessionId);
        });
    }

    onWalls(callback: (walls: string[]) => void) {
        this.socket.on("set:walls", (payload: string[]) => {
            callback(payload);
        });
    }

    onWall(callback: (wall: string) => void) {
        this.socket.on("set:wall", (payload: string) => {
            callback(payload);
        });
    }

    onDelWall(callback: (wall: string) => void) {
        this.socket.on("del:wall", (payload: string) => {
            callback(payload);
        });
    }

    emitWall(wallId: string) {
        this.socket.emit("set:wall", wallId);
    }

    emitDelWall(wallId: string) {
        this.socket.emit("del:wall", wallId);
    }

    emitUser(user: User) {
        this.socket.emit("well:")
    }
}

export default ClientController;
