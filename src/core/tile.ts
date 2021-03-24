import Wall from "./wall";
import type User from "./user";
import type TileManager from "./tile-manager";

/**tile is appended to grid apon creation*/
export default class Tile {
    tile: HTMLDivElement;
    neighborTop: Tile;
    neighborRight: Tile;
    neighborBottom: Tile;
    neighborLeft: Tile;
    manager: TileManager;
    user?: User;

    constructor(manager: TileManager) {
        this.tile = document.createElement("div");
        this.manager = manager;
        this.manager.target.appendChild(this.tile);

        this.tile.addEventListener("contextmenu", () => {
            if (this.hasWall === true) {
                this.tile.removeChild(this.tile.querySelector('[role="wall"]'));
                this.recalcNeighbors();
            }
            else {
                this.addWallAndRecalc();
            }
            this.manager.manager.emitWall(this);
        });

        this.tile.addEventListener("click", () => {
            const self = this;
            this.manager.manager.userManager.activeUser.setLocation(self);
            this.manager.manager.emitUser(this.user);
        });
    }

    /**assigns the neighboring walls to variables on the wall for later use*/
    assignNeighbors(top: Tile, right: Tile, bottom: Tile, left: Tile) {
        this.neighborTop = top;
        this.neighborRight = right;
        this.neighborBottom = bottom;
        this.neighborLeft = left;
    }

    get hasWall() {
        if (this.tile.querySelector('[role="wall"]')) {
            return true;
        } else {
            return false;
        }
    }

    get hasUser() {
        if (this.tile.querySelector('[role="user"]')) {
            return true;
        } else {
            return false;
        }
    }

    /**creates outline around tile*/
    outline() {
        this.tile.style.border = "1px solid black";
    }

    /**appends wall to tile*/
    addWall() {
        const wall = new Wall(
            this.tile,
            this.neighborTop.hasWall,
            this.neighborRight.hasWall,
            this.neighborBottom.hasWall,
            this.neighborLeft.hasWall
        );
    }

    recalcNeighbors() {
        if (this.neighborTop.hasWall) {
            this.neighborTop.recalculateWall();
        }

        if (this.neighborRight.hasWall) {
            this.neighborRight.recalculateWall();
        }

        if (this.neighborBottom.hasWall) {
            this.neighborBottom.recalculateWall();
        }

        if (this.neighborLeft.hasWall) {
            this.neighborLeft.recalculateWall();
        }
    }
    addWallAndRecalc() {
        if (this.hasWall === false) {
            this.addWall();

            this.recalcNeighbors();
        }
    }

    /**removes wall and readds it to fix rotation when new wall placed*/
    recalculateWall() {
        this.tile.removeChild(this.tile.querySelector('[role="wall"]'));
        this.addWall();
    }

    addUser(user: User) {
        this.user = user;
        this.tile.appendChild(user.avatar);
    }

    removeUser() {
        this.user = undefined;
        this.tile.removeChild(this.tile.querySelector('[role="user"]'));
    }
}
