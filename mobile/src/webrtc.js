import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
} from "react-native-webrtc";
import { getSocket } from "./socket";

const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

let peerConnection = null;
let localStream = null;

export const startCall = async (sessionId, isCaller, onRemoteStream) => {
  const socket = getSocket();

  localStream = await mediaDevices.getUserMedia({ video: true, audio: true });

  peerConnection = new RTCPeerConnection(configuration);

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    onRemoteStream(event.streams[0]);
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", { candidate: event.candidate, sessionId });
    }
  };

  if (isCaller) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer", { offer, sessionId });
  }

  socket.on("offer", async ({ offer }) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("answer", { answer, sessionId });
  });

  socket.on("answer", async ({ answer }) => {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer),
    );
  });

  socket.on("ice-candidate", async ({ candidate }) => {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  });

  return localStream;
};

export const endCall = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }
};
