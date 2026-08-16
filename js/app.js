/* ==========================================================================
   MASS ARQUITETURA — Interactive Engine (US$ 100k Standard)
   GSAP + Lenis + Three.js — refined for agency portfolio standard
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Lenis Smooth Scroll
  let lenis;
  try {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  } catch (e) {
    console.warn('Lenis not available, falling back to native scroll');
  }

  // Sync Lenis with GSAP ScrollTrigger
  if (typeof lenis === 'object' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis ? lenis.raf(time * 1000) : null;
    });
    gsap.ticker.lagSmoothing(0, 0);
  }

  // Custom Magnetic Cursor (Lerp Physics)
  const cursor = document.getElementById('custom-cursor');
  if (cursor) {
    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function renderCursor() {
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Hover states for interactive elements
    const hoverables = [
      { selector: '.proj', text: 'EXPLORE' },
      { selector: '.btn-cta', text: 'INQUIRE' },
      { selector: '.material-card', text: 'SELECT' },
      { selector: '.filter-btn', text: 'VIEW' },
      { selector: '.menu-btn', text: 'MENU' }
    ];

    hoverables.forEach(({ selector, text }) => {
      document.querySelectorAll(selector).forEach(el => {
        el.addEventListener('mouseenter', () => {
          cursor.classList.add('active');
          const txt = cursor.querySelector('.cursor-text');
          if (txt) txt.textContent = text;
        });
        el.addEventListener('mouseleave', () => {
          cursor.classList.remove('active');
          const txt = cursor.querySelector('.cursor-text');
          if (txt) txt.textContent = '';
        });
      });
    });
  }

  // Three.js WebGL Background
  let scene, camera, renderer, geometry, material, mesh, particlesCount, positions, particleGeo, particleMat, particleSystem;
  try {
    const canvas = document.getElementById('webgl-canvas');
    if (canvas && typeof THREE !== 'undefined') {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 40;

      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Tectonic geometry
      geometry = new THREE.IcosahedronGeometry(20, 1);
      material = new THREE.MeshBasicMaterial({
        color: 0xd8c3b0,
        wireframe: true,
        transparent: true,
        opacity: 0.05
      });
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Particle field
      particlesCount = 150;
      positions = new Float32Array(particlesCount * 3);
      for (let i = 0; i < particlesCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 80;
      }
      particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleMat = new THREE.PointsMaterial({
        color: 0xd8c3b0,
        size: 0.12,
        transparent: true,
        opacity: 0.25
      });
      particleSystem = new THREE.Points(particleGeo, particleMat);
      scene.add(particleSystem);

      // Light
      const ambient = new THREE.AmbientLight(0xffffff, 0.15);
      scene.add(ambient);
      const dirLight = new THREE.DirectionalLight(0xd8c3b0, 0.3);
      dirLight.position.set(10, 10, 10);
      scene.add(dirLight);

      // Mouse interaction
      let targetX = 0, targetY = 0;
      window.addEventListener('mousemove', (e) => {
        targetX = (e.clientX / window.innerWidth - 0.5) * 0.6;
        targetY = (e.clientY / window.innerHeight - 0.5) * 0.6;
      });

      const animate = () => {
        requestAnimationFrame(animate);

        if (mesh) {
          mesh.rotation.x += 0.002;
          mesh.rotation.y += 0.003;
        }
        if (particleSystem) {
          particleSystem.rotation.y -= 0.001;
        }
        if (camera) {
          camera.position.x += (targetX * 12 - camera.position.x) * 0.05;
          camera.position.y += (-targetY * 12 - camera.position.y) * 0.05;
          camera.lookAt(scene.position);
        }
        renderer.render(scene, camera);
      };
      animate();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }
  } catch (e) {
    console.warn('Three.js not available, skipping WebGL');
  }

  // GSAP Animations & ScrollTrigger
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP not fully loaded, animations will be basic');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Hero title reveal
  gsap.from('.hero h1', {
    y: 40,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
    delay: 0.3
  });

  gsap.from('.hero p, .hero-meta', {
    y: 20,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    delay: 0.5
  });

  // Section reveals on scroll
  gsap.utils.toArray('.manifesto h2, .portfolio-head h2, .principal h2').forEach(el => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });
  });

  // Portfolio card hover GSAP
  gsap.utils.toArray('.proj').forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -8,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    });
  });

  // Progress bar on scroll
  const progressBar = document.querySelector('.scroll-progress');
  if (progressBar && lenis) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(100, (scrollTop / docHeight) * 100));
      progressBar.style.width = `${progress}%`;
    });
  }
});

// Initialize on load
window.addEventListener('load', () => {
  // Force re-init of lenis if needed
  try { if (window.lenis) window.lenis.stop(); } catch (e) {}
  if (window.lenis) window.lenis.start();
});