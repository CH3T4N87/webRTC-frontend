import axios, { HttpStatusCode } from "axios";
import { Children, createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import httpStatus from "http-status";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const authContext = useContext(AuthContext);
    const [useData, setUserData] = useState(authContext);
    const router = useNavigate();

    const handleRegister = async (name, username, password) => {
        try {
            let request = await axios.post("http://localhost:3000/register", {
                name: name,
                username: username,
                password: password
            })
            if(request.status === httpStatus.CREATED){
                return request.data.message;
            }
        }catch(err){
            throw err;
        }
}
    const handleLogin = async (username , password) =>{
        try{
            let request = await axios.post("http://localhost:3000/login",{
                username : username,
                password : password
            })
            if(request.status === httpStatus.OK){
                localStorage.setItem("token",request.data.token);
                router("/home");
                // return request.data.message;
            }
        }catch(err){
            throw err;
        }
    }
     const getHistoryOfUser = async () => {
        try {
            let request = await axios.get("http://localhost:3000/get_all_activity", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data;
        } catch
         (err) {
            throw err;
        }
    };
    const addToUserHistory = async (meetingCode) => {
        try {
            let request = await axios.post("http://localhost:3000/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            return request;
        } catch (e) {
            throw e;
        }
    };

    const data = {
        useData, setUserData ,handleRegister, handleLogin, getHistoryOfUser, addToUserHistory
    }

    return(
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}