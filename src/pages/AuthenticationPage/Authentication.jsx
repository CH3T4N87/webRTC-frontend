import { useContext, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";
import Navbar from "../../Navbar";
import "../AuthenticationPage/Authentication.css";
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { AuthContext } from "../../contexts/AuthContext";

function Authentication() {
    const vantaRef = useRef(null);
    const [vantaEffect, setVantaEffect] = useState(null);
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [currentPage, SetCurrentPage] = useState(1);

    const { handleRegister, handleLogin } = useContext(AuthContext);

    let handleAuth = async () => {
        try {
            if (currentPage === 0) {
                let result = await handleLogin(username , password);
                // console.log(result);
                setMessage(result);
                setErrorMessage("");
            }
            if (currentPage === 1) {
                let result = await handleRegister(name, username, password);
                // console.log(result);
                setMessage(result);
                if(result) SetCurrentPage(0);
                setErrorMessage("");
            }

        } catch (err) {
            // console.log(err.);
            let message = err.response.data.message || "Something went wrong !!";
            console.log(message);
            setErrorMessage(message);
            setMessage("");
        }
    }


    useEffect(() => {
        if (!vantaEffect) {
            setVantaEffect(
                NET({
                    el: vantaRef.current,
                    THREE,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: window.innerHeight,
                    minWidth: window.innerWidth,
                    scale: 1.0,
                    scaleMobile: 1.0,
                    color: 0x0077ff, // Customize color
                    backgroundColor: 0x000000, // Dark theme
                    points: 10.0, // Adjust node density
                    maxDistance: 20.0, // Adjust line connections
                })
            );
        }

        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, []);

    return (
        <div className="auth-main-div" ref={vantaRef}>
            <Navbar page="auth" />
            
            
            <div className="ctm-container">
            {message && <Alert className="alertMsg" severity="success">{message}</Alert>}
            {errorMessage && <Alert className="alertMsg" severity="warning">{message}{errorMessage}</Alert>}
                <div className="authPage">
                    <div>
                        <h3 className="mt-5 text-white">{currentPage === 0 ? "Login" : "Register"}</h3>
                        <div className="curr-state mt-3"><button onClick={() => { SetCurrentPage(0) }} className={`btn text-white ${currentPage == 0 ? "btn-primary" : ""}`}>LOGIN</button>
                            <button onClick={() => { SetCurrentPage(1) }} className={`btn text-white ${currentPage == 1 ? "btn-primary" : ""}`}>REGISTER</button></div>
                        <div className="inp-group">
                            {currentPage === 1 && <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-control mt-4" placeholder="Name" />}
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="form-control mt-4" placeholder="Username"></input>
                            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control mt-4" placeholder="Password"></input>
                            <button onClick={handleAuth} className="mt-4 btn btn-secondary">{currentPage === 0 ? "Login" : "Register"}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Authentication;
