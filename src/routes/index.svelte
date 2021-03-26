<script lang="ts">
    import { io } from "socket.io-client";
    import { onMount } from "svelte";
    import ClientController from "../canvas/index";

    import SidePanel from "../components/SidePanel.svelte";

    onMount(() => {
        const socket = io();

        // stateManager = new StateManager(30, 30, socket);

        socket.on("connection", () => {
            console.log("revieved connection from socket");
        });

        const controller = new ClientController(socket);
    });
</script>

<!-- <SidePanel {stateManager} /> -->
<!-- <div id="grid" /> -->
<canvas id="canvas" />

<style>
    :global(#grid > div:hover) {
        background-color: rgb(216, 216, 216);
    }
</style>
