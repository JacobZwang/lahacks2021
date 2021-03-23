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
        origin: "*",
    },
});

const walls = templateWalls;

io.on("connection", (socket) => {
    console.log("a user connected");

    socket.emit("set:walls", walls);

    socket.on("set:user", (payload) => {
        console.log(payload);
        socket.broadcast.emit("set:user", payload);
    });
});

httpServer.listen(PORT, () => {
    console.log("socket and sapper running");
});
