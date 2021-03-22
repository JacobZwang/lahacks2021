import sirv from "sirv";
import express from "express";
import compression from "compression";
import * as sapper from "@sapper/server";
import http from "http";
import { Server } from "socket.io";
import HttpServer from "http";

import templateWalls from "./templates/template-1/walls";

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

const app = express();
app.use(
    compression({ threshold: 0 }),
    sirv("static", { dev }),
    sapper.middleware()
);

const httpServer = new HttpServer.Server(app);

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
    },
});

const walls = templateWalls;

io.on("connection", (socket) => {
    socket.emit("set:walls", walls);

    console.log("a user connected");
});

httpServer.listen(PORT, () => {
    console.log("socket and sapper running");
});
