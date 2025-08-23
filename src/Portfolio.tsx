// src/Portfolio.tsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import GlitchSection from "./GlitchSection";
import FourthSection from "./FourthSection";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, TextPlugin);

type Loc = {
  lat: number;
  lon: number;
  country: string;
  city: string;
  title: string;
  desc: string;
  rating: 5 | 4.5 | 4 | 3.5;
};

const olympiadLocations: Loc[] = [
  {
    lat: 51.5074,
    lon: -0.1278,
    country: "United Kingdom",
    city: "London",
    title: "International Geography Olympiad",
    desc: "Represented Kazakhstan at the prestigious International Geography Olympiad, competing against top students from over 40 countries. Demonstrated exceptional knowledge in physical geography, human geography, and cartographic interpretation.",
    rating: 5
  },
  {
    lat: 40.7128,
    lon: -74.0060,
    country: "United States",
    city: "New York",
    title: "International Olympiad in Informatics",
    desc: "Participated in the world's most prestigious programming competition for high school students. Solved complex algorithmic problems involving data structures, graph theory, and dynamic programming under time pressure.",
    rating: 3.5
  },
  {
    lat: 55.7558,
    lon: 37.6176,
    country: "Russia",
    city: "Moscow",
    title: "International Mathematical Olympiad",
    desc: "Competed in the oldest and most prestigious international science olympiad. Tackled challenging problems in number theory, combinatorics, algebra, and geometry that test mathematical creativity and proof techniques.",
    rating: 4.5
  },
  {
    lat: 52.5200,
    lon: 13.4050,
    country: "Germany",
    city: "Berlin",
    title: "International Physics Olympiad",
    desc: "Demonstrated mastery of advanced physics concepts including quantum mechanics, thermodynamics, and electromagnetism. Competed in both theoretical problem-solving and practical laboratory experiments.",
    rating: 4
  },
  {
    lat: 35.6762,
    lon: 139.6503,
    country: "Japan",
    city: "Tokyo",
    title: "International Chemistry Olympiad",
    desc: "Showcased expertise in organic chemistry, inorganic chemistry, and physical chemistry. Participated in rigorous theoretical examinations and hands-on laboratory practical sessions with international peers.",
    rating: 5
  }
];

type ThirdItem = { text: string; img: string };

const thirdSectionData: Record<'education' | 'research' | 'conferences', { title: string; items: ThirdItem[] }> = {
  education: {
    title: "Educational Journey",
    items: [
      { text: "Nazarbayev Intellectual School of Physics and Mathematics - Graduated with honors, specialized in advanced mathematics and theoretical physics", img: "/third/Education/nis.jpg" },
      { text: "Bowdoin College - Current student pursuing Geography and Environmental Studies with focus on Arctic research", img: "/third/Education/bowdoin.jpg" }
    ]
  },
  research: {
    title: "Research Projects",
    items: [
      { text: "Late Quaternary Paleo and Environmental Magnetism of Bellsund Drift Informs Paleo-Svalbard-Barents Sea Ice Sheet dynamics Lamont-Doherty Earth Observatory, Columbia University ", img: "/third/Research/bellsund.jpg" },
      { text: "2-D Stellar Collapse and Supernova Type II Explosion Simulation Using Python Bowdoin College, Department of Physics and Astronomy", img: "/third/Research/stellar_collapse.jpg" },
      { text: "Investigating the Implications of Sea Level Rise: Analyzing Carbon Dynamics Across High and Low Zones of Salt Marshes in Southern Maine Bowdoin College, Department of Earth and Oceanographic Sciences", img: "/third/Research/salt_marsh_maine.jpg" },
      { text: "Spatial Analysis and Comparison of Historical Sea Ice Thickness Measurements and Contemporary Data of the Canadian Arctic Archipelago and Northwest Greenland Bowdoin College, Peary-Macmillan Arctic Museum", img: "/third/Research/sea_ice_arctic.jpg" }
    ]
  },
  conferences: {
    title: "Academic Conferences",
    items: [
      { text: "Lamont-Doherty Earth Observatory Poster Presentation - Presented findings on Arctic ice dynamics to leading researchers", img: "/sanzhar.jpeg" },
      { text: "American Geophysical Union (AGU) Annual Meeting - Contributed to sessions on polar oceanography and climate science", img: "/textures/earth.jpg" },
    ]
  }
};

export default function Portfolio() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // UI state
  const [activeIndex, setActiveIndex] = useState(0);
  const [inDetails, setInDetails] = useState(false); // for React UI rendering
  const [inFourthSection, setInFourthSection] = useState(false); // for fourth section state
  const [inSecondSection, setInSecondSection] = useState(false); // visible state for details panel
  
  // Hero section animation states
  const [typewriterText, setTypewriterText] = useState("");
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showSlogan, setShowSlogan] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  // "stable" refs used inside useEffect/animation loops (avoid stale closures)
  const inDetailsRef = useRef(false);
  const activeIndexRef = useRef<number>(0);
  const focusOnRef = useRef<(i: number) => void>(() => {});
  const descRef = useRef<HTMLDivElement>(null);
  const typewriterTween = useRef<gsap.core.Tween | null>(null);
  const thirdSectionTitleRef = useRef<HTMLDivElement>(null);
  const thirdSectionContentRef = useRef<HTMLDivElement>(null);
  const thirdTitleTween = useRef<gsap.core.Tween | null>(null);
  
  // Third section extended state
  const [activeThirdTab, setActiveThirdTab] = useState<'education'|'research'|'conferences'>('education');
  const [activeThirdItem, setActiveThirdItem] = useState(0);
  const [inThird, setInThird] = useState(false); // видимость секции
  const [typedText, setTypedText] = useState("");
  const typingTween = useRef<gsap.core.Tween | null>(null);

  const thirdHeroRef = useRef<HTMLDivElement | null>(null);
  const thirdItemFillRefs = useRef<HTMLSpanElement[]>([]);
  const setThirdItemFillRef = (el: HTMLSpanElement | null, idx: number) => {
    if (!el) return;
    thirdItemFillRefs.current[idx] = el;
  };

  const thirdAutoTimer = useRef<number | null>(null);
  const thirdProgressTween = useRef<gsap.core.Tween | null>(null);
  const THIRD_ITEM_DURATION = 5; // сек. на пункт

  const stopThirdAuto = () => {
    if (thirdAutoTimer.current) {
      clearTimeout(thirdAutoTimer.current);
      thirdAutoTimer.current = null;
    }
    thirdProgressTween.current?.kill();
    // сброс всех прогресс-баров
    thirdItemFillRefs.current.forEach(el => {
      if (el) el.style.width = '0%';
    });
  };

  const startThirdAuto = () => {
    stopThirdAuto();
    const items = thirdSectionData[activeThirdTab].items;
    const idx = activeThirdItem % items.length;

    // прогресс-заливка активного пункта
    const bar = thirdItemFillRefs.current[idx];
    if (bar) {
      bar.style.width = '0%';
      thirdProgressTween.current = gsap.to(bar, {
        width: '100%',
        duration: THIRD_ITEM_DURATION,
        ease: 'none'
      });
    }

    // авто-переход
    thirdAutoTimer.current = window.setTimeout(() => {
      const next = (idx + 1) % items.length;
      setActiveThirdItem(next);
    }, THIRD_ITEM_DURATION * 1000);

    // эффект появления фото в стиле киберпанк
    if (thirdHeroRef.current) {
      gsap.fromTo(thirdHeroRef.current, 
        { opacity: 0, x: 20, skewX: -8, filter: 'blur(6px)' },
        { opacity: 1, x: 0, skewX: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' }
      );
    }
  };

  const selectThirdItem = (idx: number) => {
    setActiveThirdItem(idx);
  };

    // Use the unified olympiad locations data

      // refs to objects that need to be accessed from UI handlers
    const globeGroupRef = useRef<THREE.Group | null>(null);
    const markerRefs = useRef<THREE.Mesh[]>([]);
    const isAutoRotateRef = useRef(true);

  // keep activeIndexRef in sync with React state and trigger focus when changed while in details
  useEffect(() => {
    activeIndexRef.current = activeIndex;
    // if user changed activeIndex via buttons and we are in details — focus immediately
    if (inDetailsRef.current && focusOnRef.current) {
      focusOnRef.current(activeIndex);
    }
  }, [activeIndex]);

  // Typewriter animation for hero section
  useEffect(() => {
    const fullText = "Sanzhar Khamitov";
    let currentIndex = 0;
    
    const typewriterInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypewriterText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typewriterInterval);
        // Trigger glitch effect
        setTimeout(() => {
          setGlitchActive(true);
          setTimeout(() => {
            setGlitchActive(false);
            setShowSubtitle(true);
            // Show slogan after subtitle
            setTimeout(() => {
              setShowSlogan(true);
            }, 1500);
          }, 300);
        }, 500);
      }
    }, 100); // Fast typing speed

    return () => clearInterval(typewriterInterval);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    // Scene / Camera / Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 6);
    


    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: "high-performance" 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 1);
    mount.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    // shadows disabled for performance
    scene.add(dirLight);
    


    // Globe group
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // Earth
    const texLoader = new THREE.TextureLoader();
    const earthTex = texLoader.load("/textures/earth.jpg");
    try { (earthTex as any).anisotropy = renderer.capabilities.getMaxAnisotropy(); } catch {}
    const earthGeo = new THREE.SphereGeometry(2, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({ map: earthTex });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.castShadow = false;
    earth.receiveShadow = false;
    globeGroup.add(earth);

    // Stars (round sprite texture for circular stars)
    const starCount = 1600;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) positions[i] = (Math.random() - 0.5) * 200;
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starCanvas = document.createElement("canvas");
    starCanvas.width = 64; starCanvas.height = 64;
    const starCtx = starCanvas.getContext("2d")!;
    const grad = starCtx.createRadialGradient(32, 32, 0, 32, 32, 28);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.5, "rgba(255,255,255,0.6)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    starCtx.fillStyle = grad;
    starCtx.beginPath();
    starCtx.arc(32, 32, 28, 0, Math.PI * 2);
    starCtx.fill();
    const starTex = new THREE.CanvasTexture(starCanvas);
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      map: starTex,
      transparent: true,
      alphaTest: 0.2,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Grid background circle for third section with thin white lines
    function createGridTexture() {
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;

      // фон
      ctx.fillStyle = "#000000"; // чёрный фон
      ctx.fillRect(0, 0, size, size);

      // линии
      ctx.strokeStyle = "#ffffff"; // белые линии
      ctx.lineWidth = 0.05; // толщина линий
      const step = 32;   // шаг сетки

      for (let x = 0; x <= size; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size);
        ctx.stroke();
      }

      for (let y = 0; y <= size; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(8, 8); // плотность (увеличь число = сетка мельче)
      return texture;
    }

    const circleGeo = new THREE.CircleGeometry(2, 128);
    const circleMat = new THREE.MeshBasicMaterial({
      map: createGridTexture(),
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: true,
    });
    const bgCircle = new THREE.Mesh(circleGeo, circleMat);
    // Поставь КРУГ ЗА Землёй и сместить влево
    bgCircle.position.set(-2, 0, -0.5);
    bgCircle.scale.setScalar(0.001); // скрыт в начале
    scene.add(bgCircle);

    // Установи порядок рендера, чтобы звёзды были сзади круга, а Земля спереди
    stars.renderOrder = 0;       // звёзды сзади
    bgCircle.renderOrder = 1;    // круг посередине

    // Ensure stars don't show through the circle
    if (stars && (stars as THREE.Points).material) {
      const m = (stars as THREE.Points).material as THREE.Material & { depthWrite?: boolean; transparent?: boolean; opacity?: number; };
      if (m.transparent) m.opacity = 1;
      if (m.depthWrite === false) m.depthWrite = true; // разрешить запись в глубину
    }

    // Function to calculate needed circle scale for current viewport
    function fitCircleToViewport() {
      const dist = Math.abs(camera.position.z - bgCircle.position.z);
      const vFOV = THREE.MathUtils.degToRad(camera.fov);
      const viewHeight = 2 * Math.tan(vFOV / 2) * dist;
      const viewWidth = viewHeight * camera.aspect;
      const diag = Math.sqrt(viewWidth * viewWidth + viewHeight * viewHeight);
      const radiusNeeded = diag / 2; // geometry радиус = 1
      return radiusNeeded;
    }

    let targetCircleScale = fitCircleToViewport();

    // Подними все меши Земли
    globeGroup.traverse(o => { 
      if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).renderOrder = 2; 
    });

    // initial transform: hero centered
    globeGroup.position.set(0, 0, 0);
    globeGroup.scale.set(0.9, 0.9, 0.9);

    // === src/Portfolio.tsx — ЗАМЕНИ latLonToVec3 ЦЕЛИКОМ ===
    function latLonToVec3(latDeg: number, lonDeg: number, radius = 1) {
    // тонкая настройка под твою текстуру
    const LON_SIGN = 1;                    // если всё зеркально по восток/запад — поменяй на -1
    const LON_OFFSET_DEG = 0;              // если всё сдвинуто, пробуй 90, -90, 180

    const lat = THREE.MathUtils.degToRad(latDeg);
    const lon = THREE.MathUtils.degToRad(lonDeg * LON_SIGN + LON_OFFSET_DEG);

    // важное: Z делаем "вперёд" при lon=0, X — вправо
    const x = radius * Math.cos(lat) * Math.sin(lon);
    const y = radius * Math.sin(lat);
    const z = radius * Math.cos(lat) * Math.cos(lon);

    return new THREE.Vector3(x, y, z);
    }



    // Create markers + label sprites (hidden initially)
    const markers: THREE.Mesh[] = [];
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 1 });
    const markerGeo = new THREE.SphereGeometry(0.025, 8, 6); // Плоская красная точка (меньше и площе)

    const spriteMats: THREE.SpriteMaterial[] = [];
    const sprites: THREE.Sprite[] = [];

    for (let i = 0; i < olympiadLocations.length; i++) {
      const loc = olympiadLocations[i];
      const v = latLonToVec3(loc.lat, loc.lon, 2.01);

      const m = new THREE.Mesh(markerGeo, markerMat.clone());
      // Сдвигаем маркер правее и выше относительно локации
      const offsetX = 0.0;  // Сдвиг вправо
      const offsetY = 0.0;  // Сдвиг вверх
      m.position.set(v.x + offsetX, v.y + offsetY, v.z);
      m.visible = false;
      m.castShadow = true;
      m.receiveShadow = true;
      globeGroup.add(m);
      markers.push(m);



      // Создаем стильный canvas для текста с градиентом и тенью
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = 320;
      canvas.height = 80;
      
      // Полифилл для roundRect (поддержка старых браузеров)
      if (!ctx.roundRect) {
        (ctx as any).roundRect = function(x: number, y: number, width: number, height: number, radius: number) {
          this.beginPath();
          this.moveTo(x + radius, y);
          this.lineTo(x + width - radius, y);
          this.quadraticCurveTo(x + width, y, x + width, y + radius);
          this.lineTo(x + width, y + height - radius);
          this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          this.lineTo(x + radius, y + height);
          this.quadraticCurveTo(x, y + height, x, y + height - radius);
          this.lineTo(x, y + radius);
          this.quadraticCurveTo(x, y, x + radius, y);
          this.closePath();
        };
      }
      
      // Очищаем canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Создаем градиентный фон
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(0, 0, 0, 0.8)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.6)");
      
      // Рисуем фон с закругленными углами
      ctx.fillStyle = gradient;
      ctx.beginPath();
      (ctx as any).roundRect(0, 0, canvas.width, canvas.height, 12);
      ctx.fill();
      
      // Добавляем тонкую рамку
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Рисуем текст города (большой)
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(loc.city, canvas.width / 2, 32);
      
      // Рисуем текст страны (меньше)
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.font = "16px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(loc.country, canvas.width / 2, 55);
      
      // Добавляем маленькую иконку локации
      ctx.fillStyle = "#ff3333";
      ctx.beginPath();
      ctx.arc(20, 25, 4, 0, Math.PI * 2);
      ctx.fill();

      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      const spriteMat = new THREE.SpriteMaterial({ 
        map: tex, 
        transparent: true, 
        opacity: 0,
        sizeAttenuation: false // Текст всегда одного размера
      });
      const sprite = new THREE.Sprite(spriteMat);
      // стандартный лейбл возле поверхности
      sprite.position.copy(v.clone().multiplyScalar(1.12));
      sprite.scale.set(2, 0.5, 1);
      sprite.visible = false;
      globeGroup.add(sprite);

      spriteMats.push(spriteMat);
      sprites.push(sprite);
    }
    markerRefs.current = markers;

    // blink tweens for markers
    const createBlink = (mesh: THREE.Mesh) => {
      const mat = mesh.material as any;
      mat.transparent = true;
      return gsap.to(mat, {
        opacity: 0,
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        paused: true,
      });
    };
    const blinkTweens = markers.map((m) => createBlink(m));

    // Enhanced drag rotation with hover effects
    let isDragging = false;
    let isHovering = false;
    let prevX = 0;
    let hoverRotationSpeed = 0.0008;
    
    const onPointerDown = (e: PointerEvent) => {
      if (!isAutoRotateRef.current) return;
      isDragging = true;
      prevX = e.clientX;
      (e.target as Element).setPointerCapture?.((e as any).pointerId);
      
      // Increase rotation speed when dragging
      hoverRotationSpeed = 0.002;
    };
    
    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      hoverRotationSpeed = isHovering ? 0.0015 : 0.0008;
      try { (e.target as Element).releasePointerCapture?.((e as any).pointerId); } catch {}
    };
    
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevX;
      prevX = e.clientX;
      globeGroup.rotation.y += deltaX * 0.008;
    };
    
    const onPointerEnter = () => {
      if (!isAutoRotateRef.current || inSecondSection) return;
      isHovering = true;
      hoverRotationSpeed = 0.0015;
      
      // Add subtle glow effect to Earth only when not in second section
      if (!inSecondSection) {
        gsap.to(earthMat, {
          emissive: new THREE.Color(0x001122),
          duration: 0.5,
          ease: "power2.out"
        });
      }
    };
    
    const onPointerLeave = () => {
      isHovering = false;
      if (!isDragging) {
        hoverRotationSpeed = 0.0008;
      }
      
      // Remove glow effect only when not in second section
      if (!inSecondSection) {
        gsap.to(earthMat, {
          emissive: new THREE.Color(0x000000),
          duration: 0.5,
          ease: "power2.out"
        });
      }
    };

    mount.addEventListener("pointerdown", onPointerDown);
    mount.addEventListener("pointerup", onPointerUp);
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerenter", onPointerEnter);
    mount.addEventListener("pointerleave", onPointerLeave);

    // ScrollTrigger timeline (hero -> details)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".page",
        start: "top top",
        end: "+=350%",
        scrub: 1.2,
        anticipatePin: 1,
        onUpdate(self) {
          const inDetailsNow = self.progress >= 0.5 && self.progress < 0.75;
          if (inDetailsNow !== inDetailsRef.current) {
            setInDetails(inDetailsNow);
            inDetailsRef.current = inDetailsNow;
            // Keep auto-rotate enabled, but control it per section
            isAutoRotateRef.current = true;

            if (inDetailsNow) {
              // краткая блокировка скролла при входе в details
              const lockHandler = (e: Event) => { e.preventDefault(); };
              window.addEventListener('wheel', lockHandler, { passive: false });
              window.addEventListener('touchmove', lockHandler, { passive: false });
              setTimeout(() => {
                window.removeEventListener('wheel', lockHandler as any);
                window.removeEventListener('touchmove', lockHandler as any);
              }, 700);

              const idx = activeIndexRef.current;
              markers.forEach((m, i) => (m.visible = i === idx));
              blinkTweens.forEach((t, i) => (i === idx ? t.play() : t.pause()));
              if (focusOnRef.current) focusOnRef.current(idx);
            } else {
              markers.forEach((m) => (m.visible = false));
              blinkTweens.forEach((t) => t.pause());
              sprites.forEach((s) => (s.visible = false));
              spriteMats.forEach((sm) => { if (sm) sm.opacity = 0; });
              if (!inDetailsNow) {
                gsap.to(globeGroup.position, { x: 0, y: 0, z: 0, duration: 1.2, ease: 'power2.out' });
                gsap.to(globeGroup.scale, { x: 0.9, y: 0.9, z: 0.9, duration: 1.2, ease: 'power2.out' });
                gsap.to(globeGroup.rotation, { x: 0, y: 0, z: 0, duration: 1.2, ease: 'power2.out' });
                gsap.to(camera.position, { x: 0, y: 0, z: 6, duration: 1.2, ease: 'power2.out' });
                gsap.to(globeGroup.quaternion, { _dummy: 1, duration: 0, onUpdate: () => globeGroup.quaternion.identity() });
              }
            }
          }
        },
      },
    });

    // Track second section (details) visibility to reliably show the panel and markers
    ScrollTrigger.create({
      trigger: '.details',
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => {
        setInSecondSection(true);
        // Reset to first location and show marker immediately
        activeIndexRef.current = 0;
        setActiveIndex(0);
        setTimeout(() => {
          markers.forEach((m, i) => (m.visible = i === 0));
          blinkTweens.forEach((t, i) => (i === 0 ? t.play() : t.pause()));
          if (focusOnRef.current) {
            focusOnRef.current(0);
          }
        }, 100);
      },
      onEnterBack: () => {
        setInSecondSection(true);
        // Reset to first location and show marker immediately
        activeIndexRef.current = 0;
        setActiveIndex(0);
        setTimeout(() => {
          markers.forEach((m, i) => (m.visible = i === 0));
          blinkTweens.forEach((t, i) => (i === 0 ? t.play() : t.pause()));
          if (focusOnRef.current) {
            focusOnRef.current(0);
          }
        }, 100);
      },
      onLeave: () => {
        setInSecondSection(false);
        // Hide all markers and reset when leaving second section
        markers.forEach((m) => (m.visible = false));
        blinkTweens.forEach((t) => t.pause());
        // Reset to first location
        activeIndexRef.current = 0;
        setActiveIndex(0);
      },
      onLeaveBack: () => {
        setInSecondSection(false);
        // Hide all markers and reset when leaving second section backwards
        markers.forEach((m) => (m.visible = false));
        blinkTweens.forEach((t) => t.pause());
        // Reset to first location
        activeIndexRef.current = 0;
        setActiveIndex(0);
      },
    });

    // removed details-specific trigger (reverted to timeline onUpdate control)

    // timeline transforms (hero -> details) - Earth moves to left side and scales up
    tl.to(globeGroup.position, { x: -3, y: 0, z: 0, ease: "power2.inOut" }, 0);
    tl.fromTo(globeGroup.scale, { x: 0.9, y: 0.9, z: 0.9 }, { x: 1.5, y: 1.5, z: 1.5, ease: "power2.inOut" }, 0);

    // removed third section triggers (rollback)

    // Black curtain rise on entering third section
    const curtainEl = document.getElementById('black-curtain');
    if (curtainEl) {
      gsap.set(curtainEl, { yPercent: 100, opacity: 1 });
      gsap.to(curtainEl, {
        yPercent: 0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.third',
          start: 'top bottom',
          end: 'top top',
          scrub: 0.8,
          onLeave: () => gsap.to(curtainEl, { yPercent: 100, duration: 0.2, ease: 'power2.in' }),
          onLeaveBack: () => gsap.to(curtainEl, { yPercent: 100, duration: 0.2, ease: 'power2.in' }),
          onEnter: () => gsap.to(curtainEl, { yPercent: 0, duration: 0.2, ease: 'power2.out' }),
          onEnterBack: () => gsap.to(curtainEl, { yPercent: 0, duration: 0.2, ease: 'power2.out' }),
        },
      });
    }

    // Third section yellow circle background animation
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    ScrollTrigger.create({
      trigger: '.third',
      start: 'top center',
      end: 'bottom center',
      onEnter: () => {
        gsap.to(bgCircle.scale, {
          x: targetCircleScale,
          y: targetCircleScale,
          z: 1,
          duration: prefersReduced ? 0 : 1.1,
          ease: 'power2.out'
        });
      },
      onEnterBack: () => {
        gsap.to(bgCircle.scale, {
          x: targetCircleScale,
          y: targetCircleScale,
          z: 1,
          duration: prefersReduced ? 0 : 1.1,
          ease: 'power2.out'
        });
      },
      onLeave: () => {
        gsap.to(bgCircle.scale, {
          x: 0.001, y: 0.001, z: 1,
          duration: prefersReduced ? 0 : 0.9,
          ease: 'power2.in'
        });
      },
      onLeaveBack: () => {
        gsap.to(bgCircle.scale, {
          x: 0.001, y: 0.001, z: 1,
          duration: prefersReduced ? 0 : 0.9,
          ease: 'power2.in'
        });
      }
    });

    ScrollTrigger.create({
      trigger: '.third',
      start: 'top 70%',
      end: 'bottom 30%',
      onEnter: () => setInThird(true),
      onEnterBack: () => setInThird(true),
      onLeave: () => setInThird(false),
      onLeaveBack: () => setInThird(false),
    });

    // Fourth section globe positioning with automatic camera animation
    let cameraAnimation: (() => void) | null = null;
    
    ScrollTrigger.create({
      trigger: '.fourth',
      start: 'top center',
      end: 'bottom top',
      onEnter: () => {
        setInFourthSection(true);
        // Move globe to upper part of screen with smaller size
        gsap.to(globeGroup.position, { x: 0, y: 1.5, z: 0, duration: 1, ease: 'power2.out' });
        gsap.to(globeGroup.scale, { x: 0.7, y: 0.7, z: 0.7, duration: 1, ease: 'power2.out' });
        
        // Start automatic camera animation around Earth
        let angle = 0;
        const radius = 8;
        const animateCamera = () => {
          angle += 0.01;
          camera.position.x = Math.cos(angle) * radius;
          camera.position.z = Math.sin(angle) * radius;
          camera.position.y = Math.sin(angle * 0.5) * 2;
          camera.lookAt(globeGroup.position);
        };
        
        cameraAnimation = animateCamera;
        gsap.ticker.add(cameraAnimation);
        
        isAutoRotateRef.current = true;
        // Show markers in fourth section too
        markers.forEach((m, i) => (m.visible = i === activeIndexRef.current));
        blinkTweens.forEach((t, i) => (i === activeIndexRef.current ? t.play() : t.pause()));
        sprites.forEach((s) => (s.visible = false));
        spriteMats.forEach((sm) => { if (sm) sm.opacity = 0; });
      },
      onEnterBack: () => {
        setInFourthSection(true);
        gsap.to(globeGroup.position, { x: 0, y: 1.5, z: 0, duration: 1, ease: 'power2.out' });
        gsap.to(globeGroup.scale, { x: 0.7, y: 0.7, z: 0.7, duration: 1, ease: 'power2.out' });
        
        // Restart camera animation
        if (cameraAnimation) gsap.ticker.remove(cameraAnimation);
        let angle = 0;
        const radius = 8;
        const animateCamera = () => {
          angle += 0.01;
          camera.position.x = Math.cos(angle) * radius;
          camera.position.z = Math.sin(angle) * radius;
          camera.position.y = Math.sin(angle * 0.5) * 2;
          camera.lookAt(globeGroup.position);
        };
        
        cameraAnimation = animateCamera;
        gsap.ticker.add(cameraAnimation);
        
        isAutoRotateRef.current = true;
        markers.forEach((m, i) => (m.visible = i === activeIndexRef.current));
        blinkTweens.forEach((t, i) => (i === activeIndexRef.current ? t.play() : t.pause()));
        sprites.forEach((s) => (s.visible = false));
        spriteMats.forEach((sm) => { if (sm) sm.opacity = 0; });
      },
      onLeave: () => {
        setInFourthSection(false);
        if (cameraAnimation) {
          gsap.ticker.remove(cameraAnimation);
          cameraAnimation = null;
        }
      },
      onLeaveBack: () => {
        setInFourthSection(false);
        if (cameraAnimation) {
          gsap.ticker.remove(cameraAnimation);
          cameraAnimation = null;
        }
      }
    });

    // После инициализации всех триггеров обновляем расчёт позиций,
    // чтобы избежать расхождений при резком скролле и первичной загрузке
    try { ScrollTrigger.refresh(); } catch {}

    // focus math with offset: rotate globe so that lat/lon faces a slightly right/up direction
    // Настрой углы здесь: положительный yawDeg -> смещает маркер вправо; положительный pitchDeg -> чуть выше
    const focusOffsetYawDeg = 35;   // вправо (+) / влево (-)
    const focusOffsetPitchDeg = -30;  // выше (+) / ниже (-)

    const computeAimForward = (yawDeg: number, pitchDeg: number) => {
      const aim = new THREE.Vector3(0, 0, 1);
      const yawRad = THREE.MathUtils.degToRad(yawDeg);
      const pitchRad = THREE.MathUtils.degToRad(pitchDeg);
      // порядок Y (yaw), затем X (pitch), чтобы сдвинуть цель вправо и вверх относительно камеры
      aim.applyEuler(new THREE.Euler(pitchRad, yawRad, 0, "YXZ"));
      return aim.normalize();
    };

    const focusQuat = (lat: number, lon: number) => {
      const v = latLonToVec3(lat, lon, 1).normalize();
      const aimForward = computeAimForward(focusOffsetYawDeg, focusOffsetPitchDeg);
      const q = new THREE.Quaternion().setFromUnitVectors(v, aimForward);
      return q;
    };

    // Focus helper — animate quaternion slerp
    let focusAnim: gsap.core.Tween | null = null;
    const focusOn = (index: number) => {
      const loc = olympiadLocations[index];
      if (!loc) return;
      const targetQ = focusQuat(loc.lat, loc.lon);

      const qStart = globeGroup.quaternion.clone();
      focusAnim?.kill();

      const obj = { t: 0 };
      focusAnim = gsap.to(obj, {
        t: 1,
        duration: 1.1,
        ease: "power2.inOut",
        onUpdate: () => {
          const qInterp = qStart.clone();
          qInterp.slerp(targetQ, obj.t);
          globeGroup.quaternion.copy(qInterp);
        },
      });
        // === ДОБАВИТЬ РЯДОМ С focusOn ===
        const focusToLatLon = (lat: number, lon: number, duration = 1.0) => {
        const targetQ = focusQuat(lat, lon);        // куда хотим смотреть
        const qStart = globeGroup.quaternion.clone();

        // плавный slerp
        gsap.to({ t: 0 }, {
            t: 1,
            duration,
            ease: "power2.inOut",
            onUpdate(self) {
            const tt = (self.targets()[0] as any).t;
            const q = qStart.clone().slerp(targetQ, tt);
            globeGroup.quaternion.copy(q);
            },
        });
        };

        // пример вызова: центрировать Алма-Ату
        // focusToLatLon(43.2389, 76.8897);


      // show only that marker and start its blink
      markers.forEach((m, idx) => (m.visible = idx === index));
      blinkTweens.forEach((t, idx) => (idx === index ? t.play() : t.pause()));
    };

    // expose focusOn to outer scope via ref
    focusOnRef.current = focusOn;

    // Data is already available in olympiadLocations constant

    // ensure hidden initially
    markers.forEach((m) => (m.visible = false));
    blinkTweens.forEach((t) => t.pause());
    sprites.forEach((s) => (s.visible = false));
    spriteMats.forEach((sm) => { if (sm) sm.opacity = 0; });

    // raycaster + mouse for hover in details
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (e: MouseEvent) => {
      if (!inDetailsRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Animation loop - ensure Earth always renders
    const animate = () => {
      // Only rotate Earth when NOT in second section (static in details)
      if (!inSecondSection) {
        globeGroup.rotation.y += hoverRotationSpeed;
      }
      
      // avoid redundant renders when tab inactive
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }
      
      // Add subtle star movement for parallax effect
      if (stars) {
        stars.rotation.y += 0.0002;
        stars.rotation.x += 0.0001;
      }
      


      // hover checks only in details mode
      if (inDetailsRef.current) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(markerRefs.current);

        markerRefs.current.forEach((m, idx) => {
          const hovered = intersects.length && intersects[0].object === m;

          if (hovered) {
            sprites[idx].visible = true;
            gsap.to(spriteMats[idx], { opacity: 1, duration: 0.25 });
          } else {
            gsap.to(spriteMats[idx], {
              opacity: 0,
              duration: 0.25,
              onComplete: () => {
                sprites[idx].visible = false;
              },
            });
          }
        });
      }

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Resize
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      // adaptive DPR for performance
      const idealDpr = Math.min(window.devicePixelRatio || 1, 2);
      const dpr = (w * h > 1600 * 900) ? Math.min(idealDpr, 1.5) : idealDpr;
      renderer.setPixelRatio(dpr);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      
      // Update circle scale target for viewport changes
      targetCircleScale = fitCircleToViewport();
    };
    window.addEventListener("resize", onResize);

    // Remove smooth snapping. We'll implement section-specific scroll locks below

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      // removed obsolete snap handlers (no longer used)
      mount.removeEventListener("pointerdown", onPointerDown);
      mount.removeEventListener("pointerup", onPointerUp);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerenter", onPointerEnter);
      mount.removeEventListener("pointerleave", onPointerLeave);

      try {
        tl.kill();
        if (cameraAnimation) gsap.ticker.remove(cameraAnimation);
        ScrollTrigger.getAll().forEach((s) => s.kill());
      } catch {}
      blinkTweens.forEach((t) => t.kill());
      markers.forEach((m) => {
        if (m.material) (m.material as any).dispose?.();
        m.geometry?.dispose?.();
      });

      starGeo.dispose();
      starMat.dispose();
      try { (starTex as any).dispose?.(); } catch {}
      earthGeo.dispose();
      earthMat.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // UI handlers — update state + refs, and trigger focus if in details
  const onPrev = () => {
    setActiveIndex((i) => {
      const next = (i - 1 + olympiadLocations.length) % olympiadLocations.length;
      activeIndexRef.current = next;
      // Update markers and focus when in second section
      if (inSecondSection && focusOnRef.current) {
        focusOnRef.current(next);
      }
      return next;
    });
  };
  const onNext = () => {
    setActiveIndex((i) => {
      const next = (i + 1) % olympiadLocations.length;
      activeIndexRef.current = next;
      // Update markers and focus when in second section
      if (inSecondSection && focusOnRef.current) {
        focusOnRef.current(next);
      }
      return next;
    });
  };

  const current = olympiadLocations[activeIndex];

  // Typewriter effect for descriptions
  const typeDescription = () => {
    if (!descRef.current) return;
    
    // Cancel previous tween
    typewriterTween.current?.kill();
    
    // Clear text
    descRef.current.textContent = "";
    
    // Start fast typing
    const text = current.desc;
    const dur = Math.max(0.3, text.length / 40);
    
    typewriterTween.current = gsap.to(descRef.current, {
      text: { value: text },
      duration: dur,
      ease: "none",
    });
  };

  // Show marker at specific index
  const showMarkerAtIndex = (idx: number) => {
    // This will be implemented in the Three.js section
  };
  
  // Third section typewriter effect
  const typeThirdSectionTitle = (title: string) => {
    if (!thirdSectionTitleRef.current) return;
    
    // Cancel previous tween
    thirdTitleTween.current?.kill();
    
    // Clear text
    thirdSectionTitleRef.current.textContent = "";
    
    // Start fast typing (faster than second section)
    const dur = Math.max(0.2, title.length / 60);
    
    thirdTitleTween.current = gsap.to(thirdSectionTitleRef.current, {
      text: { value: title },
      duration: dur,
      ease: "none",
    });
  };
  
  const handleThirdTabChange = (tab: 'education'|'research'|'conferences') => {
    if (tab === activeThirdTab) return;
    setActiveThirdTab(tab);
    setActiveThirdItem(0);
  };
  
  // Typewriter animation for h2 title
  useEffect(() => {
    const title = thirdSectionData[activeThirdTab].title;
    typingTween.current?.kill();
    setTypedText("");

    typingTween.current = gsap.to({}, {
      duration: title.length * 0.05,
      repeat: 0,
      onUpdate: function () {
        const progress = this.progress();
        const chars = Math.floor(progress * title.length);
        setTypedText(title.slice(0, chars));
      }
    });
  }, [activeThirdTab]);

  // Third section auto-progression
  useEffect(() => {
    if (!inThird) return;

    startThirdAuto();
    return () => stopThirdAuto();
  }, [inThird, activeThirdTab]);

  // Second section typewriter effect
  useEffect(() => {
    if (!inSecondSection) return;
    
    if (focusOnRef.current) {
      focusOnRef.current(activeIndex);
    }
    
    typeDescription();
  }, [activeIndex, inSecondSection, current.desc]);

  // Star rating component
  const StarFull = () => (
    <span style={{ color: '#ffd700', fontSize: '16px' }}>★</span>
  );
  
  const StarHalf = () => (
    <span style={{ color: '#ffd700', fontSize: '16px' }}>★</span>
  );
  
  const StarEmpty = () => (
    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '16px' }}>☆</span>
  );

  const renderStars = (value: 5 | 4.5 | 4 | 3.5) => {
    const full = Math.floor(value);
    const half = value % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length: full }).map((_, i) => <StarFull key={'f' + i} />)}
        {Array.from({ length: half }).map((_, i) => <StarHalf key={'h' + i} />)}
        {Array.from({ length: empty }).map((_, i) => <StarEmpty key={'e' + i} />)}
      </div>
    );
  };

  // UI styles - Cyberpunk panel
  const uiPanelStyle: React.CSSProperties = {
    position: "fixed",
    left: "50%",
    bottom: "15%",
    transform: "translateX(-50%)",
    width: 400,
    background: "rgba(0,0,0,0.85)",
    color: "#fff",
    padding: "20px",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 0,
    clipPath: "polygon(20px 0%, 100% 0%, calc(100% - 20px) 100%, 0% 100%)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 0 20px rgba(0,255,255,0.1), inset 0 0 20px rgba(0,0,0,0.5)",
    pointerEvents: "auto",
    zIndex: 20,
    animation: "panelSlideUp 0.6s ease-out"
  };

  const arrowBtn: React.CSSProperties = {
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "10px 15px",
    cursor: "pointer",
    margin: "0 8px",
    transition: "all 0.3s ease",
    clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
    fontSize: "14px",
    fontWeight: "bold"
  };

  return (
    <>
      <div className="canvas-wrap" ref={mountRef} style={{ position: "fixed", inset: 0, zIndex: 0 }} />

      <div className="page pointer-none" style={{ position: "relative", zIndex: 10 }}>
        <section
          className="hero"
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: "20vh",
            padding: "0 4rem",
            position: "relative",
            background: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(8px)",
            overflow: "hidden"
          }}
        >
          {/* Profile photo with float animation */}
          <div 
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.3)",
              marginBottom: "2rem",
              transform: "translateY(-50px)",
              animation: "profileFloat 3s ease-in-out infinite, profileFadeIn 1s ease-out",
              overflow: "hidden",
              boxShadow: "0 0 20px rgba(255,255,255,0.1)",
              marginTop: "200px",
            }}
          >
            <img 
              src="/sanzhar.jpeg" 
              alt="Sanzhar Khamitov"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
              onError={(e) => {
                // Fallback if image doesn't exist
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.style.background = 'linear-gradient(135deg, #333, #666)';
                  parent.style.display = 'flex';
                  parent.style.alignItems = 'center';
                  parent.style.justifyContent = 'center';
                  parent.style.fontSize = '2rem';
                  parent.style.color = '#fff';
                  parent.textContent = 'Photo';
                }
              }}
            />
          </div>
          {/* Digital grid overlay */}
          <div 
            className="digital-grid"
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.03,
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
              pointerEvents: "none",
            }}
          />
          
          {/* Scanline effect */}
          <div 
            className="scanline"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              animation: "scanline 10s linear infinite",
              pointerEvents: "none",
            }}
          />

          {/* Main content */}
          <div style={{ 
            textAlign: "center", 
            pointerEvents: "auto", 
            color: "#fff",
            fontFamily: "'Exo', sans-serif",
            maxWidth: "800px",
            zIndex: 10,
            marginTop: "-5vh"
          }}>
            {/* Main title with typewriter and glitch */}
            <h1 
              className={`hero-title ${glitchActive ? 'glitch-effect' : ''}`}
              style={{ 
                fontSize: "4rem", 
                margin: "0 0 2rem 0", 
                fontWeight: "bold",
                letterSpacing: "0.05em",
                fontFamily: "'Exo', sans-serif",
                position: "relative",
                marginTop: "100px",
              }}
              data-text="Sanzhar Khamitov"
            >
              {typewriterText}<span className="cursor">|</span>
            </h1>
            
            {/* Subtitle with neon glow */}
            {showSubtitle && (
              <p 
                className="hero-subtitle"
                style={{ 
                  fontSize: "1.3rem", 
                  color: "#aaa", 
                  fontWeight: "300",
                  letterSpacing: "0.1em",
                  marginBottom: "2rem",
                  animation: "neonGlow 2s ease-in-out infinite alternate",
                  fontFamily: "'Exo', sans-serif"
                }}
              >
                Pupil at Bowdoin College — serial olympiad winner, geographer.
              </p>
            )}
            
            {/* Slogan */}
            {showSlogan && (
              <p 
                className="hero-slogan"
                style={{ 
                  fontSize: "1.1rem", 
                  color: "#888", 
                  fontWeight: "300",
                  letterSpacing: "0.05em",
                  opacity: 0,
                  animation: "fadeInUp 1s ease-out 0.5s forwards",
                  fontFamily: "'Exo', sans-serif"
                }}
              >
                Exploring Earth. Competing with the world. Learning without borders.
              </p>
            )}
          </div>
          
          {/* Scroll indicator */}
          <div 
            className="scroll-indicator"
            style={{
              position: "absolute",
              bottom: "2rem",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              color: "#fff",
              fontFamily: "'Exo', sans-serif",
              fontSize: "0.9rem",
              letterSpacing: "0.1em",
              animation: "pulse 2s ease-in-out infinite",
              cursor: "pointer",
              pointerEvents: "auto"
            }}
            onClick={() => {
              document.querySelector('.details')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span>SCROLL</span>
            <div 
              style={{
                width: "1px",
                height: "30px",
                background: "linear-gradient(to bottom, transparent, #fff, transparent)",
                animation: "scrollLine 2s ease-in-out infinite"
              }}
            />
            <span style={{ fontSize: "1.5rem" }}>↓</span>
          </div>
        </section>

        <section
          className="details"
          style={{
            height: "200vh",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
            padding: "4rem",
            position: "relative",
            fontFamily: "'Exo', sans-serif"
          }}
        >
          {/* Globe wrapper - left side */}
          <div 
            className="globe-wrap"
            style={{
              position: "relative",
              zIndex: 0,
              pointerEvents: "auto"
            }}
          />
          
          {/* Content - right side */}
          <div 
            className="details-right"
            style={{
              position: "relative",
              marginTop: "15rem",
              zIndex: 2,
              pointerEvents: "auto",
              color: "#fff"
            }}
          >
            <h3 
              className="details-title"
              style={{
                fontSize: "3.5rem",
                marginBottom: "2rem",
                fontWeight: "600",
                textAlign: "center",
                marginTop: "15rem",
                marginLeft: "10rem",
                marginRight: "10rem"
              }}
            >
              Olympiad Achievements
            </h3>

            {inSecondSection && (
              <>
                <div 
                  className="loc-panel"
                  role="group"
                  aria-label="location navigator"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                    border: "1px solid rgba(255,255,255,.18)",
                    background: "rgba(255,255,255,.04)",
                    borderRadius: "16px",
                    marginBottom: "12px",
                    width: "500px",
                    transform: "translateX(30%)",
                    
                  }}
                >
                  <div className="loc-meta">
                    <div 
                      className="loc-sub"
                      style={{
                        color: "#9aa0a6",
                        fontSize: "14px",
                        marginBottom: "6px"
                      }}
                    >
                      {current.country} / {current.city}
                    </div>
                    <div 
                      className="loc-title"
                      style={{
                        color: "#FFC105",
                        fontWeight: "700",
                        fontSize: "18px"
                      }}
                    >
                      {current.title}
                    </div>
                  </div>
                  <div className="loc-actions" style={{ display: "flex", gap: "8px" }}>
                    <button 
                      className="nav-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPrev();
                      }}
                      aria-label="previous"
                      style={{
                        border: "1px solid #fff",
                        background: "transparent",
                        color: "#fff",
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        fontSize: "18px",
                        cursor: "pointer",
                        transition: "transform .15s ease, background-color .15s ease",
                        pointerEvents: "auto",
                        position: "relative",
                        zIndex: 3
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.background = "rgba(255,255,255,.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      ←
                    </button>
                    <button 
                      className="nav-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNext();
                      }}
                      aria-label="next"
                      style={{
                        border: "1px solid #fff",
                        background: "transparent",
                        color: "#fff",
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        fontSize: "18px",
                        cursor: "pointer",
                        transition: "transform .15s ease, background-color .15s ease",
                        pointerEvents: "auto",
                        position: "relative",
                        zIndex: 3
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.background = "rgba(255,255,255,.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      →
                    </button>
                  </div>
                </div>

                <div 
                  className="loc-rating"
                  style={{ margin: "12px 0 20px", marginLeft: "10rem" }}
                >
                  {renderStars(current.rating)}
                </div>

                <div 
                  className="loc-desc"
                  ref={descRef}
                  style={{
                    color: "#e8eaed",
                    fontSize: "25px",
                    lineHeight: "1.45",
                    minHeight: "48px",
                    marginLeft: "10rem",
                    marginRight: "5rem",
                    pointerEvents: "none",
                    position: "relative",
                    zIndex: 1
                  }}
                />
              </>
            )}
          </div>
        </section>
        
        <section 
          className="third" 
          style={{ 
            height: "100vh",
            marginTop: "10rem",
            position: "relative",
            display: "grid",
            gridTemplateColumns: "1fr minmax(0, 620px)",
            alignItems: "center",
            padding: "4rem 5vw",
            fontFamily: "'Exo', sans-serif",
            color: "#fff",
            pointerEvents: "auto" // важно: кнопки кликаются
          }}
        >
          {/* Левая колонка — чистый фон/воздух, чтобы всё было справа */}
          <div aria-hidden />

          {/* Правая колонка — весь контент */}
          <div className="third-right" style={{ justifySelf: "end", width: "min(90vw, 620px)" }}>
            
            {/* Навигация по разделам */}
            <div className="third-nav" style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginBottom: "2rem", pointerEvents: "auto", marginRight: "6rem"}}>
              {[
                { key: 'education', label: 'Education' },
                { key: 'research', label: 'Research' },
                { key: 'conferences', label: 'Conferences' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleThirdTabChange(key as 'education'|'research'|'conferences')}
                  className={`cpk-btn ${activeThirdTab === key ? 'is-active' : ''}`}
                  aria-pressed={activeThirdTab === key}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Заголовок (typewriter у тебя уже есть; тут — чистый заголовок) */}
            <h2
              ref={thirdSectionTitleRef}
              style={{
                fontSize: "2.2rem",
                fontWeight: 700,
                marginBottom: "1.25rem",
                textAlign: "center",
                letterSpacing: "0.02em",
                fontFamily: "'Share Tech Mono', monospace"
              }}
            >
              {typedText}
              <span className="cursor">|</span>
            </h2>

            {/* Заглавное фото */}
            <div ref={thirdHeroRef} className="third-hero">
              <img
                key={`${activeThirdTab}-${activeThirdItem}`}
                src={thirdSectionData[activeThirdTab].items[activeThirdItem]?.img}
                alt="Related visual"
                className="third-hero-img"
                onError={(e) => {
                  const t = e.currentTarget as HTMLImageElement;
                  t.style.display = 'none';
                  const parent = t.parentElement as HTMLElement;
                  parent.style.background = 'linear-gradient(135deg, #222, #555)';
                  parent.style.color = '#fff';
                  parent.style.display = 'flex';
                  parent.style.alignItems = 'center';
                  parent.style.justifyContent = 'center';
                  parent.textContent = 'Image';
                }}
              />
              {/* угловые декоративные элементы */}
              <span className="corner tl" />
              <span className="corner tr" />
              <span className="corner bl" />
              <span className="corner br" />
            </div>

            {/* Кликабельные пункты с синхронизацией */}
            <div className="third-list" style={{ marginTop: "1.25rem", display: "grid", gap: "10px", backgroundColor: "#111111", fontFamily: "'Exo', monospace" }}>
              {thirdSectionData[activeThirdTab].items.map((it, idx) => (
                <button
                  key={idx}
                  className={`third-item ${idx === activeThirdItem ? 'is-active' : ''}`}
                  onClick={() => selectThirdItem(idx)}
                >
                  <span ref={(el) => setThirdItemFillRef(el, idx)} className="fill" />
                  <span className="idx">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="txt">{it.text}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="fourth" style={{ height: "100vh", position: "relative" }}>
          <FourthSection />
        </section>
        
      </div>

      {/* black curtain overlay */}
      <div id="black-curtain" style={{
        position: 'fixed', left: 0, bottom: 0, width: '100%', height: '100%',
        background: '#000', zIndex: 15, pointerEvents: 'none', transform: 'translateY(100%)'
      }} />

      
      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scanline {
            0% { transform: translateY(-100vh); }
            100% { transform: translateY(100vh); }
          }
          
          @keyframes neonGlow {
            0% { 
              color: #aaa;
              text-shadow: 0 0 5px rgba(255,255,255,0.3);
            }
            100% { 
              color: #f5f5f5;
              text-shadow: 0 0 10px rgba(255,255,255,0.6), 0 0 20px rgba(255,255,255,0.3);
            }
          }
          
          @keyframes cyberSlide {
            0% { 
              opacity: 0; 
              transform: translateX(50px) skewX(-10deg); 
              filter: blur(6px); 
            }
            100% { 
              opacity: 1; 
              transform: translateX(0) skewX(0); 
              filter: blur(0); 
            }
          }

          .cyber-btn::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s ease;
          }

          .cyber-btn:hover::after {
            left: 100%;
          }

          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* ==== THIRD SECTION (cyber-minimal b/w) ==== */

          .cpk-btn {
            position: relative;
            background: #111111;
            color: #fff;
            border: 1px solid #fff;
            padding: 10px 18px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            clip-path: polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px);
            cursor: pointer;
            overflow: hidden;
            transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
          }
          .cpk-btn::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%);
            transform: translateX(-100%);
            pointer-events: none;
          }
          .cpk-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 0 18px rgba(255,255,255,0.12);
          }
          .cpk-btn:hover::after { 
            animation: btn-scan 0.8s ease forwards; 
          }
          .cpk-btn.is-active {
            border-color:rgb(255, 132, 9);
            box-shadow: 0 0 0 1px #fff inset;
          }
          .cursor {
            display: inline-block;
            width: 1ch;
            animation: blink 0.8s steps(1) infinite;
          }
          @keyframes btn-scan {
            to { transform: translateX(100%); }
          }
          @keyframes blink {
            0%, 50% { opacity: 1; }
            50.01%, 100% { opacity: 0; }
          }

          /* hero image frame */
          .third-hero {
            position: relative;
            width: 100%;
            aspect-ratio: 16 / 9;
            border: 1px solid #fff;
            overflow: hidden;
            box-shadow: 0 0 22px rgba(255,255,255,0.08);
            background: #000;
            animation: cyberSlide 0.5s ease both;
          }
          .third-hero::before {
            content: "";
            position: absolute; inset: 0;
            background: repeating-linear-gradient( to bottom, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px );
            mix-blend-mode: screen;
            pointer-events: none;
          }
          .third-hero-img {
            width: 100%; height: 100%; object-fit: cover; display: block;
          }

          /* corner decorations */
          .third-hero .corner {
            position: absolute; width: 18px; height: 18px; border: 1px solid #fff;
          }
          .third-hero .corner.tl { top: 8px; left: 8px; border-right: none; border-bottom: none; }
          .third-hero .corner.tr { top: 8px; right: 8px; border-left: none; border-bottom: none; }
          .third-hero .corner.bl { bottom: 8px; left: 8px; border-right: none; border-top: none; }
          .third-hero .corner.br { bottom: 8px; right: 8px; border-left: none; border-top: none; }

          /* list items */
          .third-item {
            position: relative;
            display: grid;
            grid-template-columns: 2ch 1fr;
            align-items: start;
            gap: 12px;
            background: transparent;
            color: #eaeaea;
            border: 1px solid rgba(255,255,255,0.18);
            padding: 12px 14px;
            cursor: pointer;
            text-align: left;
            overflow: hidden;
            transition: border-color .2s ease, transform .15s ease, background-color .2s ease;
          }
          .third-item .idx {
            color: #fff; font-weight: 800; font-size: 12px; letter-spacing: 0.08em;
            margin-top: 2px;
          }
          .third-item .txt {
            font-size: 15px; line-height: 1.55;
          }
          .third-item .fill {
            position: absolute; left: 0; top: 0; height: 100%; width: 0%;
            background: rgba(255,255,255,0.07);
            pointer-events: none;
          }
          .third-item:hover { 
            transform: translateX(2px);
            border-color: rgba(255,255,255,0.4);
          }
          .third-item.is-active {
            border-color: #fff;
            box-shadow: inset 0 0 0 1px #fff;
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 0.6;
              transform: translateX(-50%) scale(1);
            }
            50% {
              opacity: 1;
              transform: translateX(-50%) scale(1.05);
            }
          }
          
          @keyframes scrollLine {
            0% {
              transform: scaleY(0);
              transform-origin: top;
            }
            50% {
              transform: scaleY(1);
              transform-origin: top;
            }
            100% {
              transform: scaleY(0);
              transform-origin: bottom;
            }
          }
          
          .cursor {
            animation: blink 1s infinite;
            color: #fff;
          }
          
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
          
          .glitch-effect {
            position: relative;
          }
          
          .glitch-effect::before,
          .glitch-effect::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.8;
          }
          
          .glitch-effect::before {
            color:rgb(216, 215, 215);
            z-index: -1;
            animation: glitch1 0.3s ease-in-out;
          }
          
          .glitch-effect::after {
            color:rgb(116, 116, 116);
            z-index: -2;
            animation: glitch2 0.3s ease-in-out;
          }
          
          @keyframes glitch1 {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
          }
          
          @keyframes glitch2 {
            0% { transform: translate(0); }
            20% { transform: translate(2px, -2px); }
            40% { transform: translate(2px, 2px); }
            60% { transform: translate(-2px, -2px); }
            80% { transform: translate(-2px, 2px); }
            100% { transform: translate(0); }
          }
          
          @keyframes panelSlideUp {
            0% {
              opacity: 0;
              transform: translateX(-50%) translateY(30px);
            }
            100% {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
}
          
@keyframes neonGlow {
0% { 
color: #aaa;
text-shadow: 0 0 5px rgba(255,255,255,0.3);
}
100% { 
color: #f5f5f5;
text-shadow: 0 0 10px rgba(255,255,255,0.6), 0 0 20px rgba(255,255,255,0.3);
}
}
          
@keyframes fadeInUp {
0% {
opacity: 0;
transform: translateY(20px);
}
100% {
opacity: 1;
transform: translateY(0);
}
}
          
@keyframes pulse {
0%, 100% {
opacity: 0.6;
transform: translateX(-50%) scale(1);
}
50% {
opacity: 1;
transform: translateX(-50%) scale(1.05);
}
}
          
@keyframes scrollLine {
0% {
transform: scaleY(0);
transform-origin: top;
}
50% {
transform: scaleY(1);
transform-origin: top;
}
100% {
transform: scaleY(0);
transform-origin: bottom;
}
}
          
.cursor {
animation: blink 1s infinite;
color: #fff;
}
          
@keyframes blink {
0%, 50% { opacity: 1; }
51%, 100% { opacity: 0; }
}
          
.glitch-effect {
position: relative;
}
          
.glitch-effect::before,
.glitch-effect::after {
content: attr(data-text);
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
opacity: 0.8;
}
          
.glitch-effect::before {
color:rgb(216, 215, 215);
z-index: -1;
animation: glitch1 0.3s ease-in-out;
}
          
.glitch-effect::after {
color:rgb(116, 116, 116);
z-index: -2;
animation: glitch2 0.3s ease-in-out;
}
          
@keyframes glitch1 {
0% { transform: translate(0); }
20% { transform: translate(-2px, 2px); }
40% { transform: translate(-2px, -2px); }
60% { transform: translate(2px, 2px); }
80% { transform: translate(2px, -2px); }
100% { transform: translate(0); }
}
          
@keyframes glitch2 {
0% { transform: translate(0); }
20% { transform: translate(2px, -2px); }
40% { transform: translate(2px, 2px); }
60% { transform: translate(-2px, -2px); }
80% { transform: translate(-2px, 2px); }
100% { transform: translate(0); }
}
          
@keyframes panelSlideUp {
0% {
opacity: 0;
transform: translateX(-50%) translateY(30px);
}
100% {
opacity: 1;
transform: translateX(-50%) translateY(0);
}
}
          
@keyframes textSlideIn {
0% {
opacity: 0;
transform: translateX(-20px);
}
100% {
opacity: 1;
transform: translateX(0);
}
}
          
@keyframes profileFloat {
0%, 100% {
transform: translateY(0px);
}
50% {
transform: translateY(-10px);
}
}
          
@keyframes profileFadeIn {
0% {
opacity: 0;
transform: translateY(20px) scale(0.8);
}
100% {
opacity: 1;
transform: translateY(0px) scale(1);
}
}

/* Second section specific styles */
.details, .details * { 
font-family: 'Exo', sans-serif; 
}

.loc-panel {
pointer-events: auto; 
z-index: 3;
}

.nav-btn { 
pointer-events: auto; 
position: relative; 
z-index: 3; 
}

.details-right { 
pointer-events: auto; 
z-index: 2; 
}

.loc-desc {
pointer-events: none !important;
z-index: 1 !important;
position: relative !important;
}

/* Third section Earth positioning */
.third {
position: relative;
z-index: 0;
}

.third canvas {
position: fixed !important;
top: 0 !important;
left: 0 !important;
z-index: 0 !important;
pointer-events: auto !important;
}

/* Mobile responsive grid */
@media (max-width: 900px) {
.details { 
grid-template-columns: 1fr !important; 
gap: 2rem !important;
padding: 2rem !important;
}
.globe-wrap { 
position: static !important; 
transform: none !important; 
margin: 0 auto 24px !important; 
}
.details-title {
font-size: 2rem !important;
}
}
`
}} />
</>
);
}
