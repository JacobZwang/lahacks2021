<script lang="ts">
  import { io } from "socket.io-client";

  const socket = io();

  socket.on("connection", () => {
    console.log("revieved connection from socket");
  });
</script>
