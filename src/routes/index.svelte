<script lang="ts">
  import { io } from "socket.io-client";
  import { onMount } from "svelte";
  import StateManager from "../core/state-manager";
  import TileManager from "../core/tile-manager";
  import UserManager from "../core/user-manager";

  const socket = io();

  socket.on("connection", () => {
    console.log("revieved connection from socket");
  });

  onMount(() => {
    const stateManager = new StateManager(30, 30);
    stateManager.calculateDistancesFromClient();
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
