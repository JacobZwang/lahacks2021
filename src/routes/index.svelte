<script lang="ts">
    import { io } from "socket.io-client";
    import { onMount } from "svelte";
    import ClientController from "../core/index";

    import SidePanel from "../components/SidePanel.svelte";

    let controller: ClientController;
    onMount(() => {
        const socket = io();

        socket.on("connection", () => {
            console.log("revieved connection from socket");
        });

        controller = new ClientController(socket);
        controller.world.viewModel.moveViewZ(-3500);
    });
</script>

<SidePanel {controller} />

<canvas id="canvas" />

<style>
    :global(#grid > div:hover) {
        background-color: rgb(216, 216, 216);
    }
</style>
