<script lang="ts">
  import { io } from "socket.io-client";
  import { onMount } from "svelte";
  import StateManager from "../core/state-manager";
  import TileManager from "../core/tile-manager";
  import UserManager from "../core/user-manager";

  import SidePanel from "../components/SidePanel.svelte";

  let stateManager: StateManager;

  onMount(() => {
    stateManager = new StateManager(30, 30);
    stateManager.calculateDistancesFromClient();

    const socket = io("http://localhost:3000");

    socket.on("connection", () => {
      console.log("revieved connection from socket");
    });

    socket.on("set:walls", (payload) => {
      console.log(payload);
      stateManager.tileManager.tiles.forEach((_, i) => {
        const tile = stateManager.tileManager.tiles[i];

        if (payload.some((j: number) => j === i)) {
          tile.addWallAndRecalc();
        }
      });
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
