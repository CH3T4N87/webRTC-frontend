import { useEffect, useRef, useState } from "react";
import "../LandingPage/LandingPage.css";
import * as React from 'react';
import Navbar from "../../Navbar.jsx";
import { useNavigate } from "react-router-dom";
import HeroImg from "../../../public/final-hero-img.png";


function LandingPage() {
    const [showLogin, setShowLogin] = useState(false);

    const [sakharamMsg , setSakharamMsg] = useState(false);
    const routeTo = useNavigate();
    useEffect(()=>{
        if(localStorage.getItem("token")){
            routeTo("/home");
        }
    },[]);

    let handleHover = () => {
    setSakharamMsg(true);
    setTimeout(() => setSakharamMsg(false), 2000);
};


    return (
        <div className="landing-page">
            <Navbar/>
            {sakharamMsg ? <p className="sakharam-msg alert alert-danger">Sakharam : Bhai ungli mat kr !!</p>:<></>}
            <div className="landing-page-hero">
                <div className="landing-sections left-section">
                    <div  className="hero-img">
                        <img src={HeroImg} alt="" />
                        <div onMouseEnter={handleHover} onClick={handleHover} className="faltu-div"></div>
                    </div>
                </div>
                <div className="landing-sections right-section">
                    <p>Welcome to a seamless video conferencing platform. Whether you're hosting a virtual meeting, collaborating with your team, or simply catching up with friends, our platform offers HD video calls, real-time chat, and instant screen sharing all in one powerful app.</p>
                    <div className="bt-sec"><button onClick={()=> routeTo("/auth")} className="btn btn-secondary">Get Started</button></div>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;




