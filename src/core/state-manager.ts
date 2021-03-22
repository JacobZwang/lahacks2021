import TileManager from "./tile-manager";
import type User from "./user";
import UserManager from "./user-manager";
import type Tile from "./tile";

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

        this.clientUser = this.userManager.createUser({ id: "self" });
        this.userManager.setActiveUser(this.clientUser);
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
}
