import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage.jsx";
import AuthenticationPage from './pages/AuthenticationPage/Authentication.jsx';
import './App.css'
import { AuthProvider } from './contexts/AuthContext.jsx';
import VideoMeet from './pages/VideoMeet/VideoMeet.jsx';
import HomeComponent from "./pages/Home.jsx";
import HistoryPage from './pages/History.jsx';

function App() {


  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/auth' element={<AuthenticationPage />} />
            <Route path='/home' element={<HomeComponent/>} />
            <Route path='/history' element={<HistoryPage/>} />
            <Route path='/:url' element={<VideoMeet />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App;
