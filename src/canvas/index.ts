import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

export namespace World {
    export class Model {
        tiles: Map<string, Tile.Model>;
        gridHeight: number;
        gridWidth: number;

        constructor(controller: ClientWorldController, gridHeight: number, gridWidth: number) {
            this.gridHeight = gridHeight;
            this.gridWidth = gridWidth;
            this.tiles = new Map();
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
        tiles: Map<string, Model>;
        model: Model;
        controller: ClientWorldController;

        constructor(controller: ClientWorldController) {
            this.viewHeight = window?.innerHeight ?? 1080;
            this.viewWidth = window?.innerWidth ?? 1920;
            this.viewX = 0;
            this.viewY = 0;
            this.tiles = new Map();
            this.controller = controller;
        }

        transformX(x: number) {
            return (
                x * this.transformZ(this.viewZ) +
                this.viewWidth >> 1 +
                ((this.viewX * this.viewHeight) / this.controller.model.gridHeight) *
                    this.viewZ
            );
        }
    
        transformY(y: number) {
            -y * this.transformZ(this.viewZ) +
                this.viewHeight >> 1 -
                ((this.viewX * this.viewHeight) / this.controller.model.gridHeight) *
                    this.viewZ;
        }
    
        transformZ(z: number) {
            return (z * this.viewHeight) / this.controller.model.gridHeight;
        }
    }

    export class View {
        constructor(controller: ClientWorldController) {}
    }
}

namespace Tile {
    export class Model {
        constructor() {

        }
    }

    export class ViewModel {
        constructor() {
            
        }
    }

    export class View {
        constructor() {

        }
    }
}

type Coordinate = {
    x: number;
    y: number;
};

type UserPayload = {
    publicSessionId: string;
    displayName?: string;
    location?: Coordinate;
};

class User {
    location: Coordinate;
    displayName: string;
    publicSessionId: string;

    constructor(publicSessionId: string, displayName: string, location?: Coordinate) {
        this.location = undefined;
        this.displayName = displayName;
    }

    static fromPayload(payload: {
        publicSessionId: string,
        displayName?: string
    }) {
        return new User(payload.publicSessionId, payload.displayName ?? "Unnamed")
    }
}

class ClientWorldController {
    model: World.Model;
    viewModel: World.ViewModel;
    view: World.View;

    constructor() {
        this.model = new World.Model(this, 30, 30);
        this.viewModel = new World.ViewModel(this);
        this.view = new World.View(this);
    }
}

class ClientController {
    socket: Socket;
    users: Map<string, User>;

    constructor() {
        this.socket = undefined;
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
