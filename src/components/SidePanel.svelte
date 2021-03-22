<script>
  export let stateManager;

  let wallsOutput;

  function printWalls() {
    wallsOutput = stateManager.getWallsAsJSON().toString();
  }
</script>

<div id="side-panel">
  <h1>Project Name</h1>
  <div id="tabs">
    <button> Debug Tools </button>
  </div>
  <button class="debug-button" on:click={printWalls}> Print Walls </button>
  {#if wallsOutput !== undefined}
    <div class="section">
      {wallsOutput}
    </div>
  {/if}
</div>

<style>
  /* h1 {
    border-bottom: 1pt solid black;
  } */

  #tabs {
    display: inline-flex;
    width: 100%;
    border-bottom: 1pt solid black;
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
    margin: var(--marpad);
  }
</style>
