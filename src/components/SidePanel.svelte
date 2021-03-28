<script lang="ts">
    import { onMount } from "svelte";

    import type ClientController from "../core/index";
    export let controller: ClientController;

    let wallsOutput: string;
    let mounted: boolean = false;

    onMount(() => {
        mounted = true;
    });

    function printWalls() {
        wallsOutput = JSON.stringify(controller.getWalls());
    }

    function updateName(name) {
        controller.clientUser.displayName = name;
        controller.emitUser(controller.clientUser);
    }
</script>

<div id="side-panel">
    <h1>LA Hacks 2021</h1>
    <div id="tabs">
        <button>Welcome, <b>click the map to join</b>!</button>
    </div>

    <input
        type="text"
        placeholder="Guest User"
        on:input={(e) => updateName(e.target.value)}
    />
    <!-- <div id="tabs">
        <button> Debug Tools </button>
    </div>
    <button class="debug-button" on:click={printWalls}> Print Walls </button> -->
    {#if wallsOutput !== undefined}
        <div class="section">
            {wallsOutput}
        </div>
    {/if}
    <video id="self-video" playsinline autoplay muted />
</div>

<style>
    /* h1 {
    border-bottom: 1pt solid black;
  } */

    #tabs {
        display: inline-flex;
        width: 100%;
        border-bottom: 1pt solid grey;
        font-weight: 600;
    }

    .debug-button {
        width: 100%;
        text-align: left;
    }

    .section {
        width: 100%;
        margin: var(--marpad);
        overflow-wrap: anywhere;
    }

    #side-panel {
        position: fixed;
        width: 300pt;
        height: 100%;
        top: 0;
        left: 0;
        background-color: rgba(243, 243, 243, 0.8);
        backdrop-filter: saturate(180%) blur(5px);
        -webkit-backdrop-filter: saturate(180%) blur(10px);
        overflow-y: scroll;
        overflow-x: hidden;
    }

    :global(video) {
        width: 100%;
    }

    input {
        display: block;
        height: 20pt;
        background: transparent;
        width: 100%;
        padding: 10pt;
        border: none;
        outline: none;
        font-size: 12pt;
    }
</style>
