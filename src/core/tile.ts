import Wall from "./wall"
import type User from "./user"

/**tile is appended to grid apon creation*/
export default class Tile {
    tile: HTMLDivElement;
    hasWall: boolean;
    neigborTop: Tile;
    neigborRight: Tile;
    neigborBottom: Tile;
    neigborLeft: Tile;

    constructor(target: HTMLDivElement) {
        this.tile = document.createElement("div");
        this.hasWall = false;
        target.appendChild(this.tile);

        this.tile.addEventListener("click", () => {
            if (this.hasWall === false) {
                this.addWall();

                if (this.neigborTop.hasWall) {
                    this.neigborTop.recalculateWall();
                }

                if (this.neigborRight.hasWall) {
                    this.neigborRight.recalculateWall();
                }

                if (this.neigborBottom.hasWall) {
                    this.neigborBottom.recalculateWall();
                }

                if (this.neigborLeft.hasWall) {
                    this.neigborLeft.recalculateWall();
                }
                this.hasWall = true;
            }
        });
    }

    /**assigns the neighboring walls to variables on the wall for later use*/
    assignNeigbors(top: Tile, right: Tile, bottom: Tile, left: Tile) {
        this.neigborTop = top;
        this.neigborRight = right;
        this.neigborBottom = bottom;
        this.neigborLeft = left;
    }

    /**creates outline around tile*/
    outline() {
        this.tile.style.border = "2pt solid black";
    }

    /**appends wall to tile*/
    addWall() {
        const wall = new Wall(this.tile, [
            this.neigborTop.hasWall,
            this.neigborRight.hasWall,
            this.neigborBottom.hasWall,
            this.neigborLeft.hasWall,
        ]);
    }

    /**removes wall and readds it to fix rotation when new wall placed*/
    recalculateWall() {
        this.tile.removeChild(this.tile.querySelector('[role="wall"]'));
        this.addWall();
    }

    addUser(user: User) {
        this.tile.appendChild(user.avatar);
    }

    removeUser() {
        this.tile.removeChild(this.tile.querySelector('[role="user"]'));
    }
}