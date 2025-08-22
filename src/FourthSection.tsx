import React, { useEffect, useRef } from 'react';

export default function FourthSection() {
  const textRef = useRef<HTMLDivElement>(null);
  const interestsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Анимация появления текста
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.3 }
    );

    if (textRef.current) observer.observe(textRef.current);
    if (interestsRef.current) observer.observe(interestsRef.current);

    return () => observer.disconnect();
  }, []);

  const researchInterests = [
    'Arctic Science',
    'Atmospheric Science', 
    'Climate Dynamics and Paleoclimate',
    'Environmental Geomagnetism'
  ];

  return (
    <section className="relative w-full h-screen flex flex-col justify-end pb-16 overflow-hidden">
      {/* Floating particles animation */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 text-center">
        
        {/* Main text block */}
        <div 
          ref={textRef}
          className="mb-12 opacity-0 transform translate-y-8 transition-all duration-1000"
        >
          {/* Decorative top line */}
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mb-8"></div>
          
          <p className="text-xl md:text-2xl leading-relaxed text-gray-300 max-w-4xl mx-auto font-light">
            <span className="text-cyan-400 font-medium">Motivated</span> by the structure the laws of physics and technology can provide in describing complex atmospheric phenomena, I'm driven to explore{' '}
            <span className="text-purple-400 font-medium">climate science</span> of the least predictable and the most rapidly changing region of the Earth - the{' '}
            <span className="text-cyan-300 font-semibold">Arctic</span>.
          </p>
        </div>

        {/* Research Interests Section */}
        <div 
          ref={interestsRef}
          className="opacity-0 transform translate-y-8 transition-all duration-1000 delay-300"
        >
          {/* Section title */}
          <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-8">
            Research Interests
          </h3>

          {/* Interests grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {researchInterests.map((interest, index) => (
              <div
                key={index}
                className="group relative p-6 bg-black/20 backdrop-blur-sm border border-cyan-400/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105"
                style={{
                  clipPath: 'polygon(15px 0%, 100% 0%, calc(100% - 15px) 100%, 0% 100%)',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Interest text */}
                <div className="relative z-10 flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-4 group-hover:animate-pulse"></div>
                  <span className="text-gray-300 group-hover:text-white font-medium transition-colors duration-300">
                    {interest}
                  </span>
                </div>

                {/* Corner accent */}
                <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-purple-400/30 group-hover:border-purple-400/60 transition-colors duration-300"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom decorative elements */}
        <div className="mt-12 flex justify-center items-center space-x-8">
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-cyan-400"></div>
          <div className="w-3 h-3 border-2 border-cyan-400 rotate-45 animate-pulse"></div>
          <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-purple-400"></div>
        </div>
      </div>

      {/* Side accent lines */}
      <div className="absolute left-8 top-1/2 transform -translate-y-1/2 w-0.5 h-32 bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent"></div>
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-0.5 h-32 bg-gradient-to-b from-transparent via-purple-400/50 to-transparent"></div>

      {/* Custom styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(120deg); }
            66% { transform: translateY(5px) rotate(240deg); }
          }

          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-float {
            animation: float 6s ease-in-out infinite;
          }

          .animate-fade-in {
            animation: fade-in 1s ease-out forwards;
          }

          /* Scroll-triggered animations */
          .opacity-0 {
            opacity: 0;
          }
        `
      }} />
    </section>
  );
}
