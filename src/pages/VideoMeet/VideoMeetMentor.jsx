import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import ChatIcon from '@mui/icons-material/Chat';
import "./VideoMeet.css";
import { Badge } from '@mui/material';
import chatImg from "../../../public/hehe.svg";
import sakharam from "../../../public/sakharam.jpg";
import sakhu from "../../../public/sakhu.jpg";
import { use } from 'react';

var connections = {};
let server_url = "https://livemudrix-backend.onrender.com/";
const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}
function VideoMeet() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(false);

    let [audioAvailable, setAudioAvailable] = useState(false);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState(false);

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([]);

    let [videos, setVideos] = useState([]);


    const getPermissions = async () => {
        try {
            const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            setVideoAvailable(true);
            setAudioAvailable(true);

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            window.localStream = userMediaStream;

            if (localVideoref.current) {
                localVideoref.current.srcObject = userMediaStream;
            } else {
                const waitForRef = setInterval(() => {
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                        clearInterval(waitForRef);
                    }
                }, 100);
            }

        } catch (err) {
            console.error("Permission error:", err);
            setVideoAvailable(false);
            setAudioAvailable(false);
        }
    };


    useEffect(() => {
        if (askForUsername && localVideoref.current) {
            getPermissions();
        }
    }, [askForUsername, localVideoref]);




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) };

        window.localStream = stream;
        localVideoref.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {

          
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        };

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoref.current.srcObject = window.localStream;

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        });

    }


    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);

        if (fromId !== socketIdRef.current) {

            if (!connections[fromId]) return; // Defensive check

            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    .then(() => {
                        if (signal.sdp.type === "offer") {
                            connections[fromId].createAnswer().then((description) => {
                                connections[fromId].setLocalDescription(description).then(() => {
                                    socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": description }));
                                });
                            });
                        }
                    }).catch(e => console.error("Remote SDP error:", e));
            }

            if (signal.ice) {
                if (connections[fromId].remoteDescription && connections[fromId].remoteDescription.type) {
                    connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice))
                        .catch(e => console.error("ICE candidate error:", e));
                } else {
                    console.warn("⚠️ Skipped ICE because remoteDescription is null");
                }
            }
        }
    }



    let addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    }




    let connectToSocketServer = () => {

        socketRef.current = io.connect(server_url, { secure: false });

        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on('connect', () => {

            socketRef.current.emit("join-call", window.location.href);

            socketIdRef.current = socketRef.current.id;

            socketRef.current.on("chat-message", addMessage);

            socketRef.current.on("user-left", (id) => {
                // setVideo((videos) => videos.filter((video) => video.socketId !== id));
                setVideo((videos) => Array.isArray(videos) ? videos.filter((video) => video.socketId !== id) : []);

            });


            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {

                    if (connections[socketListId]) return;

                    const peerConnection = new RTCPeerConnection(peerConfigConnections);
                    connections[socketListId] = peerConnection;

                    peerConnection.onicecandidate = (event) => {
                        if (event.candidate) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    };

                    peerConnection.onaddstream = (event) => {
                        setVideos((prev) => {
                            const exists = prev.find(v => v.socketId === socketListId);
                            const updated = exists
                                ? prev.map(v => v.socketId === socketListId ? { ...v, stream: event.stream } : v)
                                : [...prev, { socketId: socketListId, stream: event.stream }];

                            videoRef.current = updated;
                            return updated;
                        });
                    };

                    // Add local stream to peer
                    if (window.localStream) {
                        peerConnection.addStream(window.localStream);
                    } else {
                        const blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                        window.localStream = blackSilence();
                        peerConnection.addStream(window.localStream);
                    }

                    // If current user is the one who joined, send offers to others
                    if (id === socketIdRef.current) {
                        for (let id2 in connections) {
                            if (id2 === socketIdRef.current) continue;

                            try {
                                connections[id2].addStream(window.localStream);
                            } catch (e) { }

                            connections[id2].createOffer().then((description) => {
                                connections[id2].setLocalDescription(description)
                                    .then(() => {
                                        socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': description }));
                                    });
                            });
                        }
                    }
                });
            });

        })
    }


    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    const getUserMedia = async () => {
        if ((video !== undefined && videoAvailable) || (audio !== undefined && audioAvailable)) {
            await navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess) //userMediaSuccess
                .then((stream) => { })
                .catch((e) => console.log(e));
        } else {
            try {
                let trackes = localVideoref.current.srcObject.getTrackes();
                trackes.forEach(track => track.stop());
            } catch (err) {
                console.log(err);
            }
        }
    }
    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [video, audio]);

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let connect = async () => {
        setAskForUsername(false);
        // await getPermissions();
        getMedia();
    }
    let handleVideo = () => {
        if (window.localStream) {
            const videoTrack = window.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled; // This disables or enables the camera
                setVideo(videoTrack.enabled);
            }
        }
    };
    let handleAudio = () => {
        // console.log(window.localStream);
        // if (window.localStream) {
        //     const audioTrack = window.localStream.getAudioTracks()[0];
        //     if (audioTrack) {
        //         audioTrack.enabled = !audioTrack.enabled; // Mute/unmute
        //         setAudio(audioTrack.enabled);
        //     }
        // }
        setAudio(!audio);
    };
    let getDisplayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }


    let getDislayMediaSuccess = (stream) => {
      
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }
    useEffect(() => {
        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen]);

    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }

    let sendMessage = () => {
        socketRef.current.emit('chat-message', message, username)
        setMessage("");
    }


    const [sakharamConvo, setSakharamConvo] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setSakharamConvo(prev => !prev);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className='videomeet-main'>
            {askForUsername === true ?
                <div className='lobby-container'>
                    <div className="container lobby">
                        <h4 className='text-black'>Lobby</h4>
                        <input type="email" class="form-control mt-3" id="exampleFormControlInput1" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="temporary username" />
                        <button className='btn btn-secondary mt-3' onClick={connect}>Connect</button>
                    </div>
                    <div className="container v-container">
                        <video ref={localVideoref} autoPlay muted></video>
                    </div>
                    <div className={sakharamConvo ? "sakharam-div" : "sakharam-div-hide"}>
                        <div>
                            <img src={sakharam} alt="" />
                            <p className='text-white'>Sakharam ji : Ye batsurat kon h , chhiii bhai</p>
                        </div>
                        <div>
                            <img src={sakhu} alt="" />
                            <p className='text-white'>Sakhu ji : camera off krle ooy</p>
                        </div>
                    </div>
                </div>

                :

                <div className="container meet-main">




                    <video className='user-vid' ref={localVideoref} autoPlay muted></video>
                    {videos.length === 0 ? <p>No remote videos</p> : null}





                    <div className="meet-container">
                        {videos.map((video) => (
                            <div >

                                <video
                                    key={video.socketId}
                                    className='peer-vid'
                                    autoPlay
                                    playsInline
                                    ref={(ref) => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                ></video>
                                
                            </div>
                        ))}

                        {showModal ? <div className='chatSystem'>
                            <p>In-call messages</p>

                            <div className="chat-display">

                                {messages.length !== 0 ? messages.map((item, index) => {

                                
                                    return (
                                        <div className='chat-message' key={index}>

                                            <b>{item.sender}</b>
                                            <p>{item.data}</p>
                                        </div>
                                    )
                                }) : <p>No Messages Yet</p>}


                            </div>

                            <div className="chatInputs">

                                <input className='form-control' value={message} onChange={e => setMessage(e.target.value)} placeholder='Enter your chat' type="text" />
                                <button onClick={sendMessage} className='btn btn-secondary'>Send</button>
                            </div>
                        </div> : <></>}


                        <div className="meet-foot">
                            <div className="icon-container">

                              

                                {audioAvailable ? (
                                    audio ? (
                                        <i onClick={handleAudio} className="fa-solid fa-microphone icon" style={{ color: 'white' }}></i>
                                    ) : (
                                        <i onClick={handleAudio} className="fa-solid fa-microphone-slash icon" style={{ color: 'white' }}></i>
                                    )
                                ) : null}


                                {(videoAvailable && video) === true ? <i onClick={handleVideo} className="fa-solid fa-video icon"></i> : <i onClick={handleVideo} className="fa-solid fa-video-slash icon"></i>}

                                {screen === true ? <CancelPresentationIcon onClick={handleScreen} className='icon' /> : <PresentToAllIcon onClick={handleScreen} titleAccess="Start Screen Share" className='icon mui' style={{ width: '1em' }} />}

                                <i style={{ color: '#f15557' }} onClick={handleEndCall} className="fa-solid fa-phone-slash icon"></i>

                                <Badge badgeContent={newMessages} onClick={() => setModal(!showModal)} color="secondary">
                                    <ChatIcon className='icon' />
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );

}

export default VideoMeet;