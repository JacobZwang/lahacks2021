<script lang="ts">
  import { io } from "socket.io-client";
  import { onMount } from "svelte";
  import TileManager from "../core/tile-manager";

  const socket = io();

  socket.on("connection", () => {
    console.log("revieved connection from socket");
  });

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
