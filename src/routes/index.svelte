<script lang="ts">
  import { io } from "socket.io-client";
  import { onMount } from "svelte";

  const socket = io();

  socket.on("connection", () => {
    console.log("revieved connection from socket");
  });

  /**manages the tile container and the creation/management of tiles*/
  class TileManager {
    tiles: Tile[];
    target: HTMLDivElement;

    constructor(target: HTMLDivElement, width: number, height: number) {
      this.target = target;
      this.target.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
      this.target.style.gridTemplateRows = `repeat(${height}, 1fr)`;

      const margin = 20;

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
      const tile = new Tile(this.target);
      this.tiles.push(tile);
      return tile;
    }
  }

  /**tile is appended to grid apon creation*/
  class Tile {
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
      this.tile.removeChild(this.tile.childNodes[0]);
      this.addWall();
    }
  }

  /**wall is appended to target tile upon creation*/
  class Wall {
    wall: HTMLDivElement;
    constructor(
      target: HTMLDivElement,
      neighbortWalls: [boolean, boolean, boolean, boolean]
    ) {
      this.wall = document.createElement("div");
      this.wall.style.height = "100%";
      this.wall.style.width = "50%";
      this.wall.style.margin = "auto";
      this.wall.style.backgroundColor = "grey";
      target.appendChild(this.wall);

      if (
        neighbortWalls[0] === false &&
        neighbortWalls[1] === true &&
        neighbortWalls[2] === false &&
        neighbortWalls[3] === true
      ) {
        this.wall.style.height = "50%";
        this.wall.style.width = "100%";
      }

      if (
        neighbortWalls[0] === false &&
        neighbortWalls[1] === false &&
        neighbortWalls[2] === false &&
        neighbortWalls[3] === true
      ) {
        this.wall.style.height = "50%";
        this.wall.style.width = "100%";
      }

      if (
        neighbortWalls[0] === false &&
        neighbortWalls[1] === true &&
        neighbortWalls[2] === false &&
        neighbortWalls[3] === false
      ) {
        this.wall.style.height = "50%";
        this.wall.style.width = "100%";
      }
    }
  }

  onMount(() => {
    const width = 30;
    const height = 30;

    const tileManager = new TileManager(
      document.getElementById("grid") as HTMLDivElement,
      width,
      height
    );

    for (let i = 0; i < width * height; i++) {
      const tile = tileManager.createTile();
      tile.outline();
    }

    tileManager.tiles.forEach((tile, i) => {
      tile.assignNeigbors(
        tileManager.tiles[i - width],
        tileManager.tiles[i + 1],
        tileManager.tiles[i + width],
        tileManager.tiles[i - 1]
      );
    });
  });
</script>

<div id="grid" />

<style>
  #grid {
    display: grid;
    grid-template-columns: repeat(30, 1fr);
    grid-template-rows: repeat(30, 1fr);
    height: 100%;
  }
</style>
