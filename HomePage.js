import React from "react";
import { useNavigate } from "react-router-dom"; 
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="distorted-main">
      {/* Floating objects/particles */}
      {[...Array(12)].map((_, i) => (
        <div 
          key={i}
          className="floating-object"
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
            fontSize: `${Math.random() * 20 + 10}px`,
            animationDuration: `${Math.random() * 10 + 5}s`,
            animationDelay: `${Math.random() * 5}s`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        >
          {i % 3 === 0 ? '📖' : i % 2 === 0 ? '✒️' : '📕'}
        </div>
      ))}
      
      <div className="content-wrapper">
        <h1 className="glitch-text" data-text="INKVERSE">INKVERSE</h1>
        
        <p className="subtitle">WHERE BOOKS BURN BRIGHT IN THE DARK</p>
        
        <div className="buttons-container">
          <button
            onClick={() => navigate("/login", { state: { role: "user" } })}
          >
             ENTER LIBRARY
          </button>
          <button
            onClick={() => navigate("/login", { state: { role: "admin" } })}
          >
           ADMIN ACCESS
          </button>
        </div>
      </div>

      <div className="distortion-overlay"></div>
      
      
    </div>
  );
}

export default HomePage;