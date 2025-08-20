// src/Portfolio.tsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

type Location = { title: string; country: string; city: string; lat: number; lon: number };

export default function Portfolio() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // UI state
  const [activeIndex, setActiveIndex] = useState(0);
  const [inDetails, setInDetails] = useState(false); // for React UI rendering

  // "stable" refs used inside useEffect/animation loops (avoid stale closures)
  const inDetailsRef = useRef(false);
  const activeIndexRef = useRef<number>(0);
  const focusOnRef = useRef<(i: number) => void>(() => {});

    // === src/Portfolio.tsx — МЕНЯЕШЬ ЗДЕСЬ СВОИ ТОЧКИ ===
    const locations = useRef<Location[]>([
    { title: "Informatics — Finalist",  country: "Indonesia", city: "Yogyakarta", lat: -1.7956, lon: 110.3695 },
    { title: "Physics Olympiad — Gold", country: "Germany", city: "Hannover",  lat: 52.3759, lon: 9.7320 },
    { title: "Math Olympiad — Silver",  country: "Kazakhstan", city: "Almaty", lat: 43.2389, lon: 76.8897 },
    { title: "Informatics — Finalist",  country: "Indonesia", city: "Yogyakarta", lat: -7.7956, lon: 110.3695 },
    ]).current;

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

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    // Scene / Camera / Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 6);
    


    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' as any });
    let targetDpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(targetDpr);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 1);
    renderer.shadowMap.enabled = false;
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

    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
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

    // Drag rotation (enabled only when isAutoRotateRef.current === true)
    let isDragging = false;
    let prevX = 0;
    const onPointerDown = (e: PointerEvent) => {
      if (!isAutoRotateRef.current) return;
      isDragging = true;
      prevX = e.clientX;
      (e.target as Element).setPointerCapture?.((e as any).pointerId);
    };
    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      try { (e.target as Element).releasePointerCapture?.((e as any).pointerId); } catch {}
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevX;
      prevX = e.clientX;
      globeGroup.rotation.y += deltaX * 0.005;
    };

    mount.addEventListener("pointerdown", onPointerDown);
    mount.addEventListener("pointerup", onPointerUp);
    mount.addEventListener("pointermove", onPointerMove);

    // ScrollTrigger timeline (hero -> details)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".page",
        start: "top top",
        end: "+=350%",
        scrub: 1.2,
        anticipatePin: 1,
        onUpdate(self) {
          const inDetailsNow = self.progress >= 0.5;
          if (inDetailsNow !== inDetailsRef.current) {
            setInDetails(inDetailsNow);
            inDetailsRef.current = inDetailsNow;
            isAutoRotateRef.current = !inDetailsNow;

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

    // removed details-specific trigger (reverted to timeline onUpdate control)

    // timeline transforms (hero -> details)
    tl.to(globeGroup.position, { x: -5.0, y: -3.1, z: 0, ease: "power1.inOut" }, 0);
    tl.fromTo(globeGroup.scale, { x: 0.9, y: 0.9, z: 0.9 }, { x: 1.55, y: 1.55, z: 1.55, ease: "power1.inOut" }, 0);

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
        },
      });
    }

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
      const loc = locations[index];
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

    // Animation loop
    const animate = () => {
      // avoid redundant renders when tab inactive
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }
      if (isAutoRotateRef.current) {
        // rotate left slowly
        globeGroup.rotation.y += 0.0008;
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

      try {
        tl.kill();
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
      const next = (i - 1 + locations.length) % locations.length;
      activeIndexRef.current = next;
      // if we're in details view, immediately focus
      if (inDetailsRef.current && focusOnRef.current) focusOnRef.current(next);
      return next;
    });
  };
  const onNext = () => {
    setActiveIndex((i) => {
      const next = (i + 1) % locations.length;
      activeIndexRef.current = next;
      if (inDetailsRef.current && focusOnRef.current) focusOnRef.current(next);
      return next;
    });
  };

  const current = locations[activeIndex];

  // UI styles
  const uiPanelStyle: React.CSSProperties = {
    position: "fixed",
    right: 28,
    top: "30%",
    width: 320,
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    padding: "18px",
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
    pointerEvents: "auto",
  };

  const arrowBtn: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    margin: "0 8px",
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
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4rem",
            gap: "2rem",
          }}
        >
          <div style={{ width: "50%", pointerEvents: "auto", color: "#fff" }}>
            <h1 style={{ fontSize: 40, margin: 0 }}>Sanzhar Khamitov</h1>
            <p style={{ marginTop: 12, color: "#ddd" }}>
              Pupil at Bowdon College — serial olympiad winner, geographer.
            </p>
          </div>
          <div style={{ width: "50%", pointerEvents: "none" }}>{/* spacer for globe */}</div>
        </section>

        <section
          className="details"
          style={{
            height: "200vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem",
          }}
        >
          <div style={{ maxWidth: 900, color: "#fff", textAlign: "center" }}>
            <h2>Detailed achievements</h2>
            <p style={{ marginTop: 12 }}>
              Here we show detailed results, links to projects and other info. Use arrows to browse locations.
            </p>
          </div>
        </section>
        
        <section
          className="third"
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem",
            background: "#000",
          }}
        >
          <div style={{ maxWidth: 900, color: "#fff", textAlign: "center" }}>
            <h2>Third section</h2>
            <p>Clean section with the globe only. Black curtain rises on scroll.</p>
          </div>
        </section>
        
      </div>

      {/* black curtain overlay */}
      <div id="black-curtain" style={{
        position: 'fixed', left: 0, bottom: 0, width: '100%', height: '100%',
        background: '#000', zIndex: 15, pointerEvents: 'none', transform: 'translateY(100%)'
      }} />

      {/* UI panel shows only in details */}
      {inDetails && (
        <div style={uiPanelStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: "#aaa" }}>{current.country} / {current.city}</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>{current.title}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={arrowBtn} onClick={onPrev} aria-label="prev">←</button>
              <button style={arrowBtn} onClick={onNext} aria-label="next">→</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
