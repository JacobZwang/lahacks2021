import type Tile from "./tile"
import type UserManager from "./user-manager";

export default class User {
    target: HTMLDivElement;
    id: string;
    tileIn: Tile;
    avatar: HTMLDivElement;
    userManager: UserManager;

    constructor(userManager: UserManager, payload: { id: string }) {
        this.avatar = document.createElement("div");
        this.avatar.setAttribute("role", "user");
        this.avatar.style.background = "blue";
        this.avatar.style.height = "100%"
        this.avatar.style.width = "100%"
        this.id = payload.id;
        this.userManager = userManager
    }

    setLocation(tile: Tile) {
        const self = this;
        if (this.tileIn) {
            this.tileIn.removeUser();
        }
        this.tileIn = tile;
        this.tileIn.addUser(self);
    }
}