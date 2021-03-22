import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';
import http from "http";
import { Server } from "socket.io";
import { createServer } from "http";

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

const httpServer = createServer();
const app = polka();

app.use(
    compression({ threshold: 0 }),
    sirv('static', { dev }),
    sapper.middleware()
)

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
    },
});

io.on('connection', (socket) => {
    console.log('a user connected');
});

httpServer.listen(PORT, () => {
    console.log('socket and sapper running');
});

