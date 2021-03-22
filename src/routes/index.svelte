<script lang="ts">
  import { io } from "socket.io-client";
  import { onMount } from "svelte";
  import StateManager from "../core/state-manager";
  import TileManager from "../core/tile-manager";
  import UserManager from "../core/user-manager";

  import SidePanel from "../components/SidePanel.svelte";

  import templateWalls from "../templates/template-1/walls";

  const socket = io();

  socket.on("connection", () => {
    console.log("revieved connection from socket");
  });

  let stateManager: StateManager;
  onMount(() => {
    stateManager = new StateManager(30, 30);
    stateManager.calculateDistancesFromClient();

    stateManager.tileManager.tiles.forEach((_, i) => {
      const tile = stateManager.tileManager.tiles[i];

      if (templateWalls.some((j) => j === i)) {
        tile.addWallAndRecalc();
      }
    });
  });
</script>

<SidePanel {stateManager} />
<div id="grid" />

<style>
  #grid {
    display: grid;
    grid-template-columns: repeat(30, 1fr);
    grid-template-rows: repeat(30, 1fr);
    height: 100%;
  }

  :global(#grid > div:hover) {
    background-color: rgb(216, 216, 216);
  }
</style>
