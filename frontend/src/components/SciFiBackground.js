import React from 'react';

const SciFiBackground = () => {
  return (
    <div className="sci-fi-background" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -2,
      overflow: 'hidden',
      pointerEvents: 'none'
    }}>
      {/* Grid lines */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `
          linear-gradient(rgba(0, 188, 212, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 188, 212, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        opacity: 0.3,
      }}></div>

      {/* Animated particles */}
      <div className="particles" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="particle"
            style={{
              position: 'absolute',
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              backgroundColor: 'var(--primary-color)',
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 15 + 10}s linear infinite`,
              opacity: Math.random() * 0.5 + 0.2,
              boxShadow: '0 0 5px var(--primary-color)',
            }}
          />
        ))}
      </div>

      {/* Glowing orbs */}
      <div className="orbs" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const size = Math.random() * 200 + 100;
          return (
            <div 
              key={i}
              className="orb"
              style={{
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                background: `radial-gradient(circle, 
                  rgba(0, 188, 212, 0.1) 0%, 
                  rgba(0, 188, 212, 0.05) 50%, 
                  rgba(0, 188, 212, 0) 70%)`,
                borderRadius: '50%',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `pulse ${Math.random() * 10 + 10}s ease-in-out infinite alternate`,
                opacity: Math.random() * 0.3 + 0.1,
              }}
            />
          );
        })}
      </div>

      {/* Horizontal scan line */}
      <div className="scan-line" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '2px',
        backgroundColor: 'rgba(0, 188, 212, 0.2)',
        boxShadow: '0 0 10px rgba(0, 188, 212, 0.5)',
        animation: 'scan 8s linear infinite',
        opacity: 0.7,
      }}></div>

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
      `}</style>
    </div>
  );
};

export default SciFiBackground;
