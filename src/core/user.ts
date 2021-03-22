import type Tile from "./tile"

export default class User {
    target: HTMLDivElement;
    id: string;
    tileIn: Tile;
    avatar: HTMLDivElement;

    constructor() {
        this.avatar = document.createElement("div");
    }

    setLocation(tile: Tile) {
        if (this.tileIn) {
            this.tileIn.removeUser();
            this.tileIn = tile;
            this.tileIn.addUser(this);
        } else {
        }
    }
}