<script lang="ts">
    import { io } from "socket.io-client";
    import { onMount } from "svelte";
    // import StateManager from "../core/state-manager";
    import TileManager from "../core/tile-manager";
    import UserManager from "../core/user-manager";
    import CanvasController from "../canvas/canvas";

    import SidePanel from "../components/SidePanel.svelte";

    // let stateManager: StateManager;

    onMount(() => {
        const socket = io();

        // stateManager = new StateManager(30, 30, socket);

        socket.on("connection", () => {
            console.log("revieved connection from socket");
        });

        const canvas = new CanvasController(
            document.getElementById("canvas") as HTMLCanvasElement,
            30,
            30
        );

        canvas.createTiles();
    });
</script>

<!-- <SidePanel {stateManager} /> -->
<!-- <div id="grid" /> -->
<canvas id="canvas" />

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
