import type { Socket } from "socket.io-client";

export default class RTCManager {
    video: HTMLVideoElement;

    constructor(socket: Socket) {
        const config = {
            iceServers: [
                {
                    urls: ["stun:stun.l.google.com:19302"],
                },
            ],
        };

        const constraints = {
            video: true,
            audio: true,
        };

        const connections: Map<string, RTCPeerConnection> = new Map();

        this.video = document.getElementById("self-video") as HTMLVideoElement;

        navigator.mediaDevices
            .getUserMedia(constraints)
            .then((stream) => {
                this.video.srcObject = stream;
                socket.emit("broadcaster");
            })
            .catch((error) => console.error(error));

        socket.on("rtc:new", (payload: { id: string }) => {
            connections.set(payload.id, new RTCPeerConnection(config));
            const stream = this.video.srcObject as MediaStream;

            stream.getTracks().forEach((track: MediaStreamTrack) => {
                connections.get(payload.id).addTrack(track, stream);
            });

            connections.get(payload.id).onicecandidate = (e) => {
                if (e.candidate) {
                    socket.emit("rtc:candidate", {
                        id: payload.id,
                        candidate: e.candidate,
                    });
                }
            };

            connections
                .get(payload.id)
                .createOffer()
                .then((sdp) =>
                    connections.get(payload.id).setLocalDescription(sdp)
                )
                .then(() => {
                    socket.emit("rtc:offer", {
                        id: payload.id,
                        description: connections.get(payload.id)
                            .localDescription,
                    });
                    console.log(connections.get(payload.id).localDescription);
                });

            const newVideo = document.createElement("video");
            newVideo.setAttribute("playsinline", "");
            newVideo.setAttribute("autoplay", "");
            document.getElementById("side-panel").appendChild(newVideo);

            connections.get(payload.id).ontrack = (e) => {
                console.log(e);
                newVideo.srcObject = e.streams[0];
            };
        });

        socket.on("rtc:offer", (payload) => {
            connections.set(payload.id, new RTCPeerConnection(config));
            const stream = this.video.srcObject as MediaStream;

            stream.getTracks().forEach((track: MediaStreamTrack) => {
                connections.get(payload.id).addTrack(track, stream);
            });

            console.log(payload.description);

            connections
                .get(payload.id)
                .setRemoteDescription(payload.description)
                .then(() => connections.get(payload.id).createAnswer())
                .then((sdp) =>
                    connections.get(payload.id).setLocalDescription(sdp)
                )
                .then(() => {
                    socket.emit("rtc:answer", {
                        id: payload.id,
                        description: connections.get(payload.id)
                            .localDescription,
                    });
                });

            const newVideo = document.createElement("video");
            newVideo.setAttribute("playsinline", "");
            newVideo.setAttribute("autoplay", "");
            document.getElementById("side-panel").appendChild(newVideo);

            connections.get(payload.id).ontrack = (e) => {
                console.log(e);
                newVideo.srcObject = e.streams[0];
            };

            connections.get(payload.id).onicecandidate = (e) => {
                if (e.candidate) {
                    socket.emit("rtc:candidate", {
                        id: payload.id,
                        candidate: e.candidate,
                    });
                }
            };
        });

        socket.on("rtc:candidate", (payload) => {
            // console.log("candidate", payload);
            connections
                .get(payload.id)
                .addIceCandidate(new RTCIceCandidate(payload.candidate));
        });

        socket.on("rtc:answer", (payload) => {
            // console.log("answer", payload);
            console.log(connections);
            connections
                .get(payload.id)
                .setRemoteDescription(payload.description);

            connections.get(payload.id).onconnectionstatechange = (e) => {
                console.log(connections.get(payload.id).connectionState);
            };
        });
    }
}
