import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

export namespace World {
    export class Model {
        tiles: Map<string, Tile.Model>;
        gridHeight: number;
        gridWidth: number;

        constructor(
            controller: ClientWorldController,
            gridHeight: number,
            gridWidth: number
        ) {
            this.gridHeight = gridHeight;
            this.gridWidth = gridWidth;
            this.tiles = new Map();

            new Array(this.gridWidth).fill("").forEach((_, x) => {
                new Array(this.gridHeight).fill("").forEach((_, y) => {
                    this.tiles.set(`${x}:${y}`, new Tile.Model(x, y, this));
                });
            });
        }

        connectToServer() {}
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
                (x * this.transformZ(this.viewZ) + this.viewWidth) >>
                (1 +
                    ((this.viewX * this.viewHeight) /
                        this.controller.model.gridHeight) *
                        this.viewZ)
            );
        }

        transformY(y: number) {
            return (
                (-y * this.transformZ(this.viewZ) + this.viewHeight) >>
                (1 -
                    ((this.viewX * this.viewHeight) /
                        this.controller.model.gridHeight) *
                        this.viewZ)
            );
        }

        transformZ(z: number) {
            return (z * this.viewHeight) / this.controller.model.gridHeight;
        }

        setTransformX() {}
    }

    export class View {
        tiles: Set<Tile.View>;
        controller: ClientWorldController;
        canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;

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

            this.tiles.forEach((tile) => {
                tile.render();
            });

            this.canvas.addEventListener("mousedown", () => {});
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
        x: number;
        y: number;
        height: number;
        width: number;

        constructor(model: Tile.Model, parent: World.ViewModel) {
            this.x = parent.transformX(model.x);
            this.y = parent.transformY(model.y);
            this.height = parent.transformZ(1);
            this.width = parent.transformZ(1);
        }
    }

    export class View {
        viewModel: Tile.ViewModel;
        parent: World.View;

        constructor(viewModel: Tile.ViewModel, parent: World.View) {
            this.viewModel = viewModel;
            this.parent = parent;
        }

        render() {
            const ctx = this.parent.ctx;

            ctx.beginPath();
            ctx.rect(
                this.viewModel.x - this.viewModel.width / 2,
                this.viewModel.y - this.viewModel.height / 2,
                this.viewModel.width,
                this.viewModel.height
            );
            ctx.stroke();
            ctx.closePath();
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

    constructor() {
        this.model = new World.Model(this, 30, 30);
        this.viewModel = new World.ViewModel(this);
        this.view = new World.View(this);
    }
}

export default class ClientController {
    socket: Socket;
    users: Map<string, User>;
    world: ClientWorldController;

    constructor() {
        this.socket = undefined;
        this.world = new ClientWorldController();
    }

    connect(io: Socket) {
        this.socket = io;
    }

    onUserNew(callback: (user: User, payload?: UserPayload) => void) {
        this.socket.on("new:user", (payload: UserPayload) => {
            this.users.set(payload.publicSessionId, User.fromPayload(payload));
            callback(this.users.get(payload.publicSessionId));
        });
    }

    onUserSet(callback: (user: User, payload?: UserPayload) => void) {
        this.socket.on("set:user", (payload: UserPayload) => {
            this.users.set(payload.publicSessionId, User.fromPayload(payload));
            callback(this.users.get(payload.publicSessionId));
        });
    }

    onUserMove(callback: (user: User, payload?: UserPayload) => void) {
        this.socket.on("set:user", (payload: UserPayload) => {
            this.users.set(payload.publicSessionId, User.fromPayload(payload));
            callback(this.users.get(payload.publicSessionId));
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
            callback(payload.publicSessionId);
        });
    }
}
