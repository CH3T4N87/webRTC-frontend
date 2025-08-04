import React, { useContext, useEffect, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import "./Home.css";
import videoImg from "../../public/videocall.svg";


function Home() {

    const [userName, setUserName] = useState("Hulululu");
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");

    const [newMeet , setNewMeet] = useState("Create a New Meet");
    const [hoverMsg,setHoverMsg] = useState(0);


    const { addToUserHistory } = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`)
    }
    useEffect(() => {
        const fetchDetails = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    let res = await axios.get(`http://localhost:3000/get-user-details/${token}`);
                    if (res) { setUserName(res.data.name) };
                } catch (e) {
                    console.log(e);
                };

            }
        }
        fetchDetails();
    }, []);

    let handleHover = () =>{
        setHoverMsg(purana => purana + 1);
        if(hoverMsg < 2){
            setNewMeet("Soch le ekbar");
        }else if(hoverMsg > 3){
            setNewMeet("Bade dheet ho yrr tum");
        }else if(hoverMsg >= 2){
            setNewMeet("bar bar hover mat kr")
        }
        setTimeout(()=>{
            setNewMeet("Create a New Meet")
        },2000)
    }

    return (
        <div className="home-page">
            <div className="top-bar">


                <div><h5 className='text-white'>  Welcome, {userName === "Mudra" ? "Jaan ❤️" : userName}</h5></div>
                


                <div className="top-bar-links">

                    <button className='btn btn-secondary' onClick={
                        () => {
                            navigate("/history")
                        }
                    }>History</button>

                    <button className='btn btn-danger' onClick={() => {
                        localStorage.removeItem("token")
                        navigate("/auth")
                    }}>
                        Logout
                    </button>
                </div>


            </div>

            <div className="home-section">
                <div className="sections home-left">
                    <img src={videoImg} alt="" />
                </div>
                <div className="sections home-right">
                    <div><input className='form-control text-white' onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined" placeholder='Enter the Meeting Code (Sahi se dalna)' />
                    <button className='btn btn-secondary mt-2' onClick={handleJoinVideoCall} variant='contained'>Join</button>
                    <p className=''>want to host a meet ?</p>
                    <button className='new-meet btn btn-secondary ' onMouseEnter={handleHover} onClick={()=> navigate(`/le-bhai-le-new-meeting-le-${Math.floor(Math.random()*100)}`)} >{newMeet}</button>
                    </div>
                    
                </div>

            </div>
        </div>
    )
}


export default withAuth(Home);