import Tile from "./tile"
import type StateManager from "./state-manager"

/**manages the tile container and the creation/management of tiles*/
export default class TileManager {
    tiles: Tile[];
    target: HTMLDivElement;
    manager: StateManager;

    constructor(manager: StateManager, target: HTMLDivElement, width: number, height: number) {
        this.target = target;
        this.target.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
        this.target.style.gridTemplateRows = `repeat(${height}, 1fr)`;

        const margin = 20;

        this.manager = manager

        if (window.innerHeight < window.innerWidth) {
            //add math to make fit on screen when it isn't square
            this.target.style.height = window.innerHeight - margin + "px";
            this.target.style.width = window.innerHeight - margin + "px";
        } else {
            this.target.style.height = window.innerWidth + "px";
            this.target.style.width = window.innerWidth + "px";
        }

        this.tiles = [];
    }

    /**saves tile to state and appends to target*/
    createTile() {
        const self = this;
        const tile = new Tile(self);
        this.tiles.push(tile);
        return tile;
    }
}