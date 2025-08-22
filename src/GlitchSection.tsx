import React, { useEffect, useRef } from 'react';

export default function GlitchSection() {
  const glitchRef1 = useRef<HTMLHeadingElement>(null);
  const glitchRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add glitch animation intervals
    const glitchElements = [glitchRef1.current, glitchRef2.current];
    
    const glitchIntervals = glitchElements.map((element) => {
      if (!element) return null;
      
      return setInterval(() => {
        element.classList.add('glitch-active');
        setTimeout(() => {
          element.classList.remove('glitch-active');
        }, 200);
      }, Math.random() * 3000 + 2000); // Random interval between 2-5 seconds
    });

    return () => {
      glitchIntervals.forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, []);

  return (
    <section className="relative w-full h-[200vh] bg-black overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-cyan-900/30" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }}
      />

      {/* Glitch scanlines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-pulse" 
             style={{ 
               backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)',
               animation: 'scanlines 2s linear infinite'
             }} />
      </div>

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-8">
        {/* Welcome text */}
        <h3 className="text-cyan-400 text-lg font-light tracking-[0.3em] mb-4 opacity-80">
          WELCOME TO
        </h3>

        {/* Main glitch titles */}
        <div className="relative mb-8">
          <h2 
            ref={glitchRef1}
            className="glitch-text text-6xl md:text-8xl font-black text-white mb-2 tracking-wider"
            data-text="SANZHAR"
          >
            SANZHAR
          </h2>
          <div 
            ref={glitchRef2}
            className="glitch-text text-4xl md:text-6xl font-black text-purple-400 tracking-wider"
            data-text="KHAMITOV"
          >
            KHAMITOV
          </div>
        </div>

        {/* Subtitle */}
        <h6 className="text-gray-400 text-sm md:text-base font-light tracking-[0.2em] mb-8 max-w-2xl">
          GEOGRAPHER • RESEARCHER • OLYMPIAD CHAMPION
        </h6>

        {/* Explore button */}
        <div className="relative group">
          <button className="relative px-8 py-3 bg-transparent border-2 border-cyan-400 text-cyan-400 font-bold tracking-[0.2em] text-sm hover:bg-cyan-400 hover:text-black transition-all duration-300 overflow-hidden">
            {/* Button glitch effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative z-10">EXPLORE</span>
          </button>
        </div>
      </div>

      {/* Bottom shape divider */}
      <div className="absolute bottom-0 left-0 right-0 transform rotate-180">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-16">
          <path className="fill-cyan-500/20" d="M0,6V0h1000v100L0,6z"/>
        </svg>
      </div>

      {/* Custom styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scanlines {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
          }

          .glitch-text {
            position: relative;
            display: inline-block;
          }

          .glitch-text::before,
          .glitch-text::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            pointer-events: none;
          }

          .glitch-text::before {
            color: #ff0080;
            z-index: -1;
          }

          .glitch-text::after {
            color: #00ffff;
            z-index: -2;
          }

          .glitch-active::before {
            opacity: 0.8;
            animation: glitch-1 0.2s ease-in-out;
          }

          .glitch-active::after {
            opacity: 0.8;
            animation: glitch-2 0.2s ease-in-out;
          }

          @keyframes glitch-1 {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
          }

          @keyframes glitch-2 {
            0% { transform: translate(0); }
            20% { transform: translate(2px, -2px); }
            40% { transform: translate(2px, 2px); }
            60% { transform: translate(-2px, -2px); }
            80% { transform: translate(-2px, 2px); }
            100% { transform: translate(0); }
          }

          .glitch-active {
            animation: text-flicker 0.2s ease-in-out;
          }

          @keyframes text-flicker {
            0% { opacity: 1; }
            10% { opacity: 0.8; }
            20% { opacity: 1; }
            30% { opacity: 0.9; }
            40% { opacity: 1; }
            50% { opacity: 0.8; }
            60% { opacity: 1; }
            70% { opacity: 0.9; }
            80% { opacity: 1; }
            90% { opacity: 0.8; }
            100% { opacity: 1; }
          }
        `
      }} />
    </section>
  );
}
