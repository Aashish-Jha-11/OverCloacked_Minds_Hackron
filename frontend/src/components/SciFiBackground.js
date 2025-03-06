import React, { useState, useEffect, useRef } from 'react';
import '../styles/animations.css';

const SciFiBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const backgroundRef = useRef(null);
  
  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Get mouse position relative to the window
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Handle visibility change for battery saving
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div 
      ref={backgroundRef}
      className="sci-fi-background" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -2,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: isVisible ? 0.8 : 0.4,
        transition: 'opacity 1s ease-in-out'
      }}
    >
      {/* Background gradient that responds to mouse movement */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(
            circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
            rgba(15, 35, 65, 0.85) 0%, 
            rgba(10, 25, 45, 0.95) 70%
          )`,
          transition: 'background 0.5s ease-out',
          zIndex: -1
        }}
      ></div>
      
      {/* Grid lines */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(rgba(13, 110, 253, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(13, 110, 253, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          backgroundPosition: `${mousePosition.x * 10}px ${mousePosition.y * 10}px`,
          opacity: 0.5,
          transition: 'background-position 0.2s ease-out',
        }}
      ></div>
      
      {/* Animated particles */}
      <div 
        className="particles" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          animation: isVisible ? 'none' : 'fadeInOut 3s infinite',
        }}
      >
        {Array.from({ length: 30 }).map((_, i) => {
          const size = Math.random() * 4 + 1;
          const duration = Math.random() * 15 + 10;
          const initialDelay = Math.random() * -20;
          
          return (
            <div 
              key={i}
              className="particle"
              style={{
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: i % 3 === 0 ? 'var(--primary-color)' : i % 3 === 1 ? 'var(--accent-color)' : '#00ffff',
                borderRadius: '50%',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `
                  float ${duration}s linear ${initialDelay}s infinite, 
                  glow 3s ease-in-out infinite alternate
                `,
                opacity: Math.random() * 0.5 + 0.2,
                boxShadow: i % 5 === 0 ? '0 0 8px var(--primary-color)' : '0 0 5px var(--accent-color)',
                transform: `scale(${isVisible ? 1 : 0.5})`,
                transition: 'transform 0.5s ease',
              }}
            />
          );
        })}
      </div>
      
      {/* Digital circuit lines */}
      <div 
        className="circuit-lines" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => {
          const startX = Math.random() * 100;
          const startY = Math.random() * 100;
          const width = Math.random() * 150 + 50;
          const height = Math.random() * 150 + 50;
          
          return (
            <svg 
              key={i}
              width={width}
              height={height}
              style={{
                position: 'absolute',
                top: `${startY}%`,
                left: `${startX}%`,
                opacity: 0.4,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              <path
                d={`M0,${height/2} 
                   L${width*0.3},${height/2} 
                   L${width*0.4},${height*0.3} 
                   L${width*0.6},${height*0.7} 
                   L${width*0.8},${height*0.5} 
                   L${width},${height*0.5}`}
                fill="none"
                stroke="var(--primary-color)"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="pulse-border"
              />
              <circle 
                cx={width*0.8} 
                cy={height*0.5} 
                r="4" 
                fill="var(--accent-color)"
                className="highlight-glow"
              />
            </svg>
          );
        })}
      </div>
      
      {/* Glowing orbs */}
      <div 
        className="orbs" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const size = Math.random() * 300 + 150;
          const posX = Math.random() * 100;
          const posY = Math.random() * 100;
          const duration = Math.random() * 10 + 10;
          
          // Calculate slight position adjustment based on mouse
          const adjustX = (mousePosition.x - 0.5) * 10;
          const adjustY = (mousePosition.y - 0.5) * 10;
          
          return (
            <div 
              key={i}
              className="orb"
              style={{
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                background: `
                  radial-gradient(circle, 
                  rgba(0, 188, 212, 0.1) 0%, 
                  rgba(0, 188, 212, 0.05) 50%, 
                  rgba(0, 188, 212, 0) 70%)
                `,
                borderRadius: '50%',
                top: `calc(${posY}% + ${adjustY}px)`,
                left: `calc(${posX}% + ${adjustX}px)`,
                animation: `pulse ${duration}s ease-in-out infinite alternate`,
                opacity: Math.random() * 0.3 + 0.1,
                transition: 'top 0.5s ease-out, left 0.5s ease-out',
              }}
            />
          );
        })}
      </div>
      
      {/* Horizontal scan lines */}
      <div 
        className={`scan-line ${isVisible ? '' : 'paused'}`} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '2px',
          backgroundColor: 'rgba(0, 188, 212, 0.2)',
          boxShadow: '0 0 10px rgba(0, 188, 212, 0.5)',
          animation: 'scan 8s linear infinite',
          opacity: 0.7,
        }}
      ></div>
      
      {/* Secondary scan line */}
      <div 
        className={`scan-line secondary ${isVisible ? '' : 'paused'}`} 
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          height: '1px',
          backgroundColor: 'rgba(102, 16, 242, 0.2)',
          boxShadow: '0 0 8px rgba(102, 16, 242, 0.5)',
          animation: 'scan 12s linear 4s infinite',
          opacity: 0.5,
        }}
      ></div>
      
      {/* Corner decorative elements */}
      <div 
        className="corner-element top-left" 
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '80px',
          height: '80px',
          borderTop: '2px solid rgba(0, 188, 212, 0.3)',
          borderLeft: '2px solid rgba(0, 188, 212, 0.3)',
          opacity: 0.7,
        }}
      ></div>
      
      <div 
        className="corner-element top-right" 
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '80px',
          height: '80px',
          borderTop: '2px solid rgba(0, 188, 212, 0.3)',
          borderRight: '2px solid rgba(0, 188, 212, 0.3)',
          opacity: 0.7,
        }}
      ></div>
      
      <div 
        className="corner-element bottom-left" 
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          width: '80px',
          height: '80px',
          borderBottom: '2px solid rgba(0, 188, 212, 0.3)',
          borderLeft: '2px solid rgba(0, 188, 212, 0.3)',
          opacity: 0.7,
        }}
      ></div>
      
      <div 
        className="corner-element bottom-right" 
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '80px',
          height: '80px',
          borderBottom: '2px solid rgba(0, 188, 212, 0.3)',
          borderRight: '2px solid rgba(0, 188, 212, 0.3)',
          opacity: 0.7,
        }}
      ></div>
      
      <style jsx="true">{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-40px) translateX(0);
          }
          75% {
            transform: translateY(-20px) translateX(-10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.2;
          }
          100% {
            transform: scale(1);
            opacity: 0.1;
          }
        }
        
        @keyframes scan {
          0% {
            top: -10%;
          }
          100% {
            top: 110%;
          }
        }
        
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .paused {
          animation-play-state: paused !important;
        }
        
        .corner-element {
          transition: all 0.3s ease;
        }
        
        .corner-element:hover {
          border-color: rgba(0, 188, 212, 0.8);
          box-shadow: 0 0 15px rgba(0, 188, 212, 0.5);
        }
      `}</style>
    </div>
  );
};

export default SciFiBackground;
