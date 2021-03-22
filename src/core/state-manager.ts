import TileManager from "./tile-manager";
import type User from "./user";
import UserManager from "./user-manager";

export default class StateManager {
    userManager: UserManager;
    tileManager: TileManager;
    clientUser: User;

    constructor(width: number, height: number) {
        const self = this;
        this.userManager = new UserManager(self);
        this.tileManager = new TileManager(
            self,
            document.getElementById("grid") as HTMLDivElement,
            width,
            height
        );

        for (let i = 0; i < width * height; i++) {
            const tile = this.tileManager.createTile();
            tile.outline();
        }

        this.tileManager.tiles.forEach((tile, i) => {
            tile.assignNeighbors(
                this.tileManager.tiles[i - width],
                this.tileManager.tiles[i + 1],
                this.tileManager.tiles[i + width],
                this.tileManager.tiles[i - 1]
            );
        });

        const clientUser = this.userManager.createUser({ id: "self" });
        this.userManager.setActiveUser(clientUser);
    }
}
