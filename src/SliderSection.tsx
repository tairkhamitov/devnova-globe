import React, { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Подключаем стили
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface SlideData {
  id: string;
  title: string;
  content: string[];
  mainImage: string;
  sliderImages: string[];
}

const slidesData: SlideData[] = [
  {
    id: 'education',
    title: 'Education',
    content: [
      'College: Bowdoin College, Brunswick, ME, USA',
      'School: Nazarbayev Intellectual School in Aktobe, Kazakhstan'
    ],
    mainImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
    sliderImages: [
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop'
    ]
  },
  {
    id: 'research',
    title: 'Research Projects',
    content: [
      'Late Quaternary Paleo and Environmental Magnetism of Bellsund Drift Informs Paleo-Svalbard-Barents Sea Ice Sheet dynamics',
      'Lamont-Doherty Earth Observatory, Columbia University',
      'Role: Undergraduate Research Intern, May 2025 – Present',
      '',
      '2-D Stellar Collapse and Supernova Type II Explosion Simulation Using Python',
      'Bowdoin College, Department of Physics and Astronomy',
      '',
      'Investigating the Implications of Sea Level Rise: Analyzing Carbon Dynamics Across High and Low Zones of Salt Marshes in Southern Maine',
      'Bowdoin College, Department of Earth and Oceanographic Sciences',
      '',
      'Spatial Analysis and Comparison of Historical Sea Ice Thickness Measurements and Contemporary Data of the Canadian Arctic Archipelago and Northwest Greenland',
      'Bowdoin College, Peary-Macmillan Arctic Museum'
    ],
    mainImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    sliderImages: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop'
    ]
  },
  {
    id: 'conferences',
    title: 'Scientific Conferences and Presentations',
    content: [
      'Lamont-Doherty Earth Observatory Poster Presentation (Palisades, NY) - August, 2025',
      'American Geophysical Union Annual Meeting (New Orleans, LA) - December, 2025'
    ],
    mainImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    sliderImages: [
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=400&h=300&fit=crop'
    ]
  }
];

export default function SliderSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [typewriterText, setTypewriterText] = useState('');
  const [isTypewriterComplete, setIsTypewriterComplete] = useState(false);
  const swiperRef = useRef<any>(null);
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);

  const handleCategoryClick = (index: number) => {
    console.log('Button clicked:', index); // Отладка
    setActiveSlide(index);
    setActiveImageIndex(0);
    startTypewriter(slidesData[index].title);
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideTo(index);
    }
  };

  const startTypewriter = (text: string) => {
    setTypewriterText('');
    setIsTypewriterComplete(false);
    if (typewriterRef.current) clearTimeout(typewriterRef.current);
    
    let i = 0;
    const typeChar = () => {
      if (i < text.length) {
        setTypewriterText(text.slice(0, i + 1));
        i++;
        typewriterRef.current = setTimeout(typeChar, 100);
      } else {
        setIsTypewriterComplete(true);
      }
    };
    typeChar();
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => 
      prev === slidesData[activeSlide].sliderImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => 
      prev === 0 ? slidesData[activeSlide].sliderImages.length - 1 : prev - 1
    );
  };

  // Эффект для синхронизации состояния
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.on('slideChange', () => {
        const newIndex = swiperRef.current.swiper.activeIndex;
        setActiveSlide(newIndex);
        setActiveImageIndex(0);
        startTypewriter(slidesData[newIndex].title);
      });
    }
  }, []);

  // Инициализация typewriter для первого слайда
  useEffect(() => {
    startTypewriter(slidesData[0].title);
    return () => {
      if (typewriterRef.current) clearTimeout(typewriterRef.current);
    };
  }, []);

  // Автоматическая смена изображений в слайдере
  useEffect(() => {
    const interval = setInterval(nextImage, 3000);
    return () => clearInterval(interval);
  }, [activeSlide]);

  return (
    <section className="relative w-full h-screen bg-black overflow-hidden flex">
      {/* Cyberpunk background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Navigation buttons */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 flex justify-center items-center gap-6 w-full max-w-5xl px-8 pointer-events-none">
        <div className="flex gap-6 pointer-events-auto">
        {slidesData.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => handleCategoryClick(index)}
            className={`
              flex-1 px-4 py-3 text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300
              border-2 backdrop-blur-sm relative overflow-hidden group min-w-0 text-center
              ${activeSlide === index 
                ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-lg shadow-cyan-400/50' 
                : 'border-purple-500/50 bg-black/40 text-purple-300 hover:border-purple-400 hover:bg-purple-400/10'
              }
            `}
            style={{
              clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)'
            }}
          >
            {/* Glitch effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            
            {/* Button text */}
            <span className="relative z-10 whitespace-nowrap overflow-hidden text-ellipsis">
              {slide.title.length > 20 ? slide.title.substring(0, 17) + '...' : slide.title}
            </span>
            
            {/* Active indicator */}
            {activeSlide === index && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 animate-pulse" />
            )}
          </button>
        ))}
        </div>
      </div>

      {/* Left side - Images */}
      <div className="w-1/2 h-full relative overflow-hidden">
        {/* Main image */}
        <div className="absolute inset-0 transition-all duration-1000 ease-out transform hover:scale-105">
          <img 
            src={slidesData[activeSlide].mainImage} 
            alt={slidesData[activeSlide].title}
            className="w-full h-full object-cover filter brightness-75 hover:brightness-90 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
        </div>
        
        {/* Image slider */}
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex gap-4 mb-4">
            {slidesData[activeSlide].sliderImages.map((img, index) => (
              <div 
                key={index}
                className={`relative w-24 h-16 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 transform ${
                  index === activeImageIndex 
                    ? 'scale-110 ring-2 ring-cyan-400 shadow-lg shadow-cyan-400/50' 
                    : 'scale-100 hover:scale-105 opacity-70 hover:opacity-100'
                }`}
                onClick={() => setActiveImageIndex(index)}
              >
                <img 
                  src={img} 
                  alt={`${slidesData[activeSlide].title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            ))}
          </div>
          
          {/* Slider navigation */}
          <div className="flex justify-between items-center">
            <button 
              onClick={prevImage}
              className="w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm border border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/20 transition-all duration-300 flex items-center justify-center"
            >
              ‹
            </button>
            <div className="flex gap-2">
              {slidesData[activeSlide].sliderImages.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === activeImageIndex ? 'bg-cyan-400' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <button 
              onClick={nextImage}
              className="w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm border border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/20 transition-all duration-300 flex items-center justify-center"
            >
              ›
            </button>
          </div>
        </div>
        
        {/* Cyberpunk overlay effects */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-400/70 animate-pulse" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-purple-400/70 animate-pulse" />
      </div>

      {/* Right side - Content */}
      <div className="w-1/2 h-full relative flex items-center justify-center p-12">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          loop={false}
          autoplay={false}
          pagination={{ 
            clickable: true,
            bulletClass: 'swiper-pagination-bullet cyberpunk-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active cyberpunk-bullet-active'
          }}
          navigation={{
            nextEl: '.cyberpunk-next',
            prevEl: '.cyberpunk-prev'
          }}
          onSlideChange={(swiper) => {
            const newIndex = swiper.activeIndex;
            setActiveSlide(newIndex);
            setActiveImageIndex(0);
            startTypewriter(slidesData[newIndex].title);
          }}
          onSwiper={(swiper) => {
            if (swiperRef.current) {
              swiperRef.current.swiper = swiper;
            }
          }}
          className="w-full h-full"
          ref={swiperRef}
          allowTouchMove={true}
          watchSlidesProgress={true}
        >
          {slidesData.map((slide, index) => (
            <SwiperSlide key={slide.id}>
              <div className="w-full h-full flex flex-col justify-center">
                {/* Typewriter Title */}
                <div className="mb-8">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 min-h-[1.2em] relative">
                    {index === activeSlide ? typewriterText : slide.title}
                    {index === activeSlide && !isTypewriterComplete && (
                      <span className="animate-pulse text-cyan-400">|</span>
                    )}
                  </h2>
                </div>
                
                {/* Animated decorative line */}
                <div className={`w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mb-8 rounded-full transition-all duration-1000 ${
                  isTypewriterComplete ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                } origin-left`} />
                
                {/* Content with cyberpunk animations */}
                <div className="space-y-4 text-gray-300 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-400 scrollbar-track-gray-800">
                  {slide.content.map((line, lineIndex) => (
                    <div 
                      key={lineIndex}
                      className={`transform transition-all duration-700 ${
                        isTypewriterComplete 
                          ? 'translate-x-0 opacity-100' 
                          : 'translate-x-8 opacity-0'
                      }`}
                      style={{ transitionDelay: `${lineIndex * 100}ms` }}
                    >
                      <p className={`
                        text-base md:text-lg leading-relaxed transition-all duration-300 hover:text-white relative overflow-hidden group
                        ${line === '' ? 'mb-4' : ''}
                        ${line.includes('Role:') || line.includes('College:') || line.includes('School:') 
                          ? 'text-cyan-300 font-semibold border-l-2 border-cyan-400 pl-4 hover:border-cyan-300' 
                          : ''
                        }
                        ${line.includes('Lamont-Doherty') || line.includes('Bowdoin College') 
                          ? 'text-purple-300 font-medium border-l-2 border-purple-400 pl-4 hover:border-purple-300' 
                          : ''
                        }
                      `}>
                        {/* Cyberpunk glitch effect on hover */}
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="relative z-10">{line}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Custom navigation arrows */}
      <button className="cyberpunk-prev absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-50 w-14 h-14 border-2 border-cyan-400 bg-black/70 backdrop-blur-sm text-cyan-400 hover:bg-cyan-400/20 hover:scale-110 transition-all duration-300 group rounded-lg pointer-events-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-500 rounded-lg pointer-events-none" />
        <span className="relative z-10 text-2xl font-bold pointer-events-none">‹</span>
      </button>
      
      <button className="cyberpunk-next absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-50 w-14 h-14 border-2 border-cyan-400 bg-black/70 backdrop-blur-sm text-cyan-400 hover:bg-cyan-400/20 hover:scale-110 transition-all duration-300 group rounded-lg pointer-events-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-500 rounded-lg pointer-events-none" />
        <span className="relative z-10 text-2xl font-bold pointer-events-none">›</span>
      </button>
      
      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-400/50"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-400/50"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-purple-400/50"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-purple-400/50"></div>

      {/* Custom styles for pagination */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .cyberpunk-bullet {
            width: 14px !important;
            height: 14px !important;
            background: rgba(139, 92, 246, 0.5) !important;
            border: 2px solid #8b5cf6 !important;
            opacity: 1 !important;
            margin: 0 8px !important;
            border-radius: 50% !important;
            transition: all 0.3s ease !important;
          }
          
          .cyberpunk-bullet:hover {
            transform: scale(1.2) !important;
            box-shadow: 0 0 15px rgba(139, 92, 246, 0.5) !important;
          }
          
          .cyberpunk-bullet-active {
            background: rgba(34, 211, 238, 0.8) !important;
            border-color: #22d3ee !important;
            box-shadow: 0 0 25px rgba(34, 211, 238, 0.8) !important;
            transform: scale(1.3) !important;
          }
          
          .scrollbar-thin {
            scrollbar-width: thin;
          }
          
          .scrollbar-thumb-cyan-400::-webkit-scrollbar-thumb {
            background-color: #22d3ee;
            border-radius: 4px;
          }
          
          .scrollbar-track-gray-800::-webkit-scrollbar-track {
            background-color: #1f2937;
          }
          
          ::-webkit-scrollbar {
            width: 6px;
          }
        `
      }} />
    </section>
  );
}
