import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Fingerprint from '@mui/icons-material/Fingerprint';
import { useNavigate } from 'react-router-dom';
import "./Navbar.css";

function Navbar({ page }) {
    const routeTo = useNavigate();
    const quotes = [
        "be-always-happy",
        "spread-kindness",
        "love-wins-always",
        "dream-without-fear",
        "smile-everyday",
        "you-are-enough",
        "choose-joy-today",
        "stay-golden-child",
        "peace-begins-within",
        "breathe-and-believe",
        "radiate-good-vibes",
        "trust-your-journey",
        "kindness-is-strength",
        "hope-is-beautiful",
        "shine-like-a-star",
        "laugh-more-often",
        "grateful-heart-wins",
        "grow-with-grace",
        "happiness-inside-out",
        "embrace-the-chaos",
        "you-matter-most",
        "believe-in-yourself",
        "follow-the-light",
        "live-love-learn",
        "magic-is-everywhere",
        "soft-heart-strong-mind",
        "calm-over-chaos",
        "create-and-conquer",
        "live-fully-now",
        "radiate-serenity"
    ];


    const getMeetingCode = () => {
        return Math.floor(Math.random() * 30);
    }
    return (
        <nav className={`navbar navbar-expand-lg bg-body-tertiary custom-navbar ${page === "auth" ? "auth-navbar-changes":""}`}>
            <div class="container-fluid">
                <a className="navbar-brand" href="/"><img src="/logo.png" />Hulululu App</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a href={`${quotes[getMeetingCode()]}`}><IconButton aria-label="fingerprint" color="secondary" a>
                                <Fingerprint className='fingerprint'/>
                            </IconButton></a>
                            <button className={`nav-link ${page === "auth" ? "text-white " : ""}`} onClick={() => routeTo(`/${quotes[getMeetingCode()]}`)} aria-current="page" href="/auth">Guest</button>
                        </li>

                        <li className="nav-item">
                            <a href="/auth"><IconButton aria-label="fingerprint" color="success" a>
                                <Fingerprint  className='fingerprint'/>
                            </IconButton></a>
                            <a className={`nav-link ${page === "auth" ? "text-white" : ""}`} href="/auth">
                                Connect</a>
                        </li>

                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;