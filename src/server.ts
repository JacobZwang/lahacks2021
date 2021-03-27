import sirv from "sirv";
import express from "express";
import compression from "compression";
import * as sapper from "@sapper/server";
import http from "http";
import { Server } from "socket.io";
import HttpServer from "http";
import {Bigtable} from "@google-cloud/bigtable"
import templateWalls from "./templates/template-1/walls";

const { PORT, NODE_ENV, NAME, LOGS_DB } = process.env;
const dev = NODE_ENV === "development";

const bigtable = new Bigtable();
const instance = bigtable.instance(LOGS_DB);
const logsTable = instance.table('logs')
const now = new Date();
logsTable.insert({
    key: now.getTime(),
    data: {
        logs: "are illegal"
    }
})
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

const walls = new Set(templateWalls);
const users = new Map();
const RTCBroadcasts = new Map();
const RTCListeners = new Map();

io.on("connection", (socket) => {
    socket.emit("set:walls", Array.from(walls));

    const rtcConnections = new Map();

    users.forEach((user) => {
        socket.emit("set:user", user);
    });

    socket.on("set:wall", (payload) => {
        walls.add(payload);
        socket.broadcast.emit("set:wall", payload);
    });

    socket.on("del:wall", (payload) => {
        walls.delete(payload);
        socket.broadcast.emit("del:wall", payload);
    });

    socket.on("set:user", (payload) => {
        const user = users.get(payload.id);

        if (user) {
            user.location = payload.location;
        } else {
            users.set(payload.id, payload);
            rtcConnections.set(payload.id, false);
        }

        socket.broadcast.emit("set:user", payload);

        users.forEach((i) => {
            if (
                rtcConnections.get(i.id) === undefined &&
                i.location !== undefined &&
                i.id !== socket.id
            ) {
                socket.to(i.id).emit("rtc:new", { id: socket.id });
                rtcConnections.set(payload.id, true);
            }
        });
    });

    socket.on("rtc:offer", (payload) => {
        socket.to(payload.id).emit("rtc:offer", {
            id: socket.id,
            description: payload.description,
        });
        rtcConnections.set(payload.id, true);
    });

    socket.on("rtc:candidate", (payload) => {
        socket.to(payload.id).emit("rtc:candidate", {
            id: socket.id,
            candidate: payload.candidate,
        });
        rtcConnections.set(payload.id, true);
    });

    socket.on("rtc:answer", (payload) => {
        socket.to(payload.id).emit("rtc:answer", {
            id: socket.id,
            description: payload.description,
        });
        rtcConnections.set(payload.id, true);
    });

    socket.on("disconnect", () => {
        users.delete(socket.id);
        io.emit("del:user", { id: socket.id });
        io.emit("del:video");
    });
});

httpServer.listen(PORT, () => {
    console.log("socket and sapper running");
});
