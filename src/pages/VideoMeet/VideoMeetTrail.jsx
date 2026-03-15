import { useEffect, useRef } from "react";
import { io } from "socket.io-client";



export default function VideoMeet() {

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  const socketRef = useRef(null);
  const remoteSocketId = useRef(null);

  useEffect(() => {

    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("connect", () => {
      console.log("Connected to signaling server:", socketRef.current.id);

      socketRef.current.emit("join-call", "room1");
    });

    socketRef.current.on("user-joined", (id, clients) => {

      console.log("User joined:", id);

      if (id === socketRef.current.id) return;

      remoteSocketId.current = id;

      createOffer(id);

    });

    socketRef.current.on("signal", async (fromId, message) => {

      console.log("Signal received:", message.type);

      if (message.type === "offer") {
        await handleOffer(fromId, message.sdp);
      }

      if (message.type === "answer") {
        await handleAnswer(message.sdp);
      }

      if (message.type === "ice-candidate") {

        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(message.candidate)
        );

      }

    });

    startCamera();

  }, []);

  const startCamera = async () => {

    try {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStream.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      createPeerConnection();

    } catch (err) {
      console.error("Camera error:", err);
    }

  };

  const createPeerConnection = () => {

    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ]
    });

    localStream.current.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, localStream.current);
    });

    peerConnection.current.onicecandidate = (event) => {

      if (event.candidate && remoteSocketId.current) {

        socketRef.current.emit("signal", remoteSocketId.current, {
          type: "ice-candidate",
          candidate: event.candidate
        });

      }

    };

    // createOffer();


    peerConnection.current.ontrack = (event) => {

      console.log("Remote stream received", event.streams);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }

    };

  };

  const createOffer = async (targetId) => {

    try {

      const offer = await peerConnection.current.createOffer();

      await peerConnection.current.setLocalDescription(offer);

      socketRef.current.emit("signal", targetId, {
        type: "offer",
        sdp: offer
      });

    } catch (error) {
      console.error("Offer error:", error);
    }

  };

  const handleOffer = async (fromId, offer) => {

    try {

      remoteSocketId.current = fromId;

      // Ensure camera is ready
      if (!localStream.current) {
        await startCamera();
      }

      if (!peerConnection.current) {
        createPeerConnection();
      }

      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peerConnection.current.createAnswer();

      await peerConnection.current.setLocalDescription(answer);

      socketRef.current.emit("signal", fromId, {
        type: "answer",
        sdp: answer
      });

    } catch (error) {
      console.error("Error handling offer:", error);
    }

  };

  const handleAnswer = async (answer) => {

    try {

      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );

    } catch (error) {
      console.error("Error handling answer:", error);
    }

  };

  return (
    <div>
      <h2>My Video</h2>

      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "400px" }}
      />

      <h2>Remote Video</h2>

      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "400px" }}
      />
    </div>
  );
}