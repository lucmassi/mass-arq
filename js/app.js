/* ==========================================================================
   MASS ARQUITETURA — SÃO PAULO // NEW YORK
   Interactive Engine & WebGL Shader Architecture (US$ 100k+ Standard)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLenisScroll();
  initCustomCursor();
  initWebGLBackground();
  initGSAPAnimations();
  initMonographEngine();
  initFilterSystem();
  initMaterialityShowcase();
  initConsultationModal();
  initSmoothPageTransitions();
});

// --------------------------------------------------------------------------
// 1. LENIS SMOOTH SCROLL INTEGRATION WITH GSAP SYNC
// --------------------------------------------------------------------------
let lenis;
function initLenisScroll() {
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1.05,
      smoothTouch: false,
      touchMultiplier: 2,
      weight: 0.3,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0, 0);
    }
  }

  // Header scroll class toggle & scroll progress
  const header = document.querySelector('header.site-header');
  const progressBar = document.querySelector('.scroll-progress');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (header) {
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    if (progressBar) {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollY / totalHeight;
      progressBar.style.width = `${progress * 100}%`;
    }
  });
}

// --------------------------------------------------------------------------
// 2. CUSTOM MAGNETIC CURSOR WITH LERP PHYSICS, SHADER STATE & EXPANDED HIT AREAS
// --------------------------------------------------------------------------
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const cursorText = cursor ? cursor.querySelector('.cursor-text') : null;

  if (!cursor) return;

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;
  let targetScale = 1;
  let isInteracting = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function renderCursor() {
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;

    // Lerp-based smoothing with physics variance
    cursorX += dx * 0.16;
    cursorY += dy * 0.16;

    // Dynamic scaling based on interaction intensity
    if (isInteracting) {
      targetScale = 0.85 + Math.abs(dx * 0.002) + Math.abs(dy * 0.002);
    } else {
      targetScale = 1;
    }

    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%) scale(${targetScale})`;
    cursor.style.width = `${8 + 44 * (1 - targetScale)}px`;
    cursor.style.height = `${8 + 44 * (1 - targetScale)}px`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover targets with contextual text and shader state
  const hoverables = [
    { selector: '.monograph-card', text: 'EXPLORE MONOGRAPH', hitRadius: 80 },
    { selector: '.btn-cta', text: 'INQUIRY', hitRadius: 64 },
    { selector: '.material-card', text: 'SELECT', hitRadius: 48 },
    { selector: '.nav-link, .filter-btn', text: 'VIEW', hitRadius: 56 },
    { selector: '.modal-close-btn', text: 'CLOSE', hitRadius: 40 },
    { selector: '.hero-title', text: 'READ', hitRadius: 120 },
  ];

  // Intersection observers for hit area detection
  const hitObservers = [];

  hoverables.forEach(({ selector, text, hitRadius }) => {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isHovering = Array.from(entries).some(entry => entry.isIntersecting);
        
        // Update cursor state based on hover
        if (isHovering) {
          cursor.classList.add('active');
          if (cursorText) cursorText.textContent = text;
          cursor.classList.add('expanded-' + selector.split('.')[1] || 'cta');
          isInteracting = true;
        } else {
          cursor.classList.remove('active');
          if (cursorText) cursorText.textContent = '';
          cursor.classList.remove('expanded-' + selector.split('.')[1] || 'cta');
          isInteracting = false;
        }
      },
      { threshold: 0.15 }
    );

    elements.forEach(el => {
      observer.observe(el);
      hitObservers.push(observer);
    });
  });

  // Cursor leave resets when mouse leaves viewport
  const viewportObserver = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) {
        cursor.classList.remove('active');
        if (cursorText) cursorText.textContent = '';
        cursor.classList.remove('expanded-cta');
        cursor.classList.remove('expanded-monograph-card');
        cursor.classList.remove('expanded-btn-cta');
        cursor.classList.remove('expanded-material-card');
        cursor.classList.remove('expanded-nav-link');
        cursor.classList.remove('expanded-modal-close-btn');
        cursor.classList.remove('expanded-hero-title');
        isInteracting = false;
      }
    },
    { root: null }
  );

  viewportObserver.observe(document.querySelector('body'));
}

// --------------------------------------------------------------------------
// 3. THREE.JS WEBGL BACKGROUND CANVAS — TECTONIC WIREFRAME WITH CURSOR INTERACTION
// --------------------------------------------------------------------------
function initWebGLBackground() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 40;
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
  renderer.setClearColor(0x050505, 1);

  // Tectonic Icosahedron Wireframe — Golden Ratio proportions
  const geometry = new THREE.IcosahedronGeometry(22, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0xd8c3b0,
    wireframe: true,
    transparent: true,
    opacity: 0.04,
    linewidth: 1
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Dual-layer wireframe for depth perception
  const geometryInner = new THREE.IcosahedronGeometry(16, 1);
  const materialInner = new THREE.MeshBasicMaterial({
    color: 0x48cae4,
    wireframe: true,
    transparent: true,
    opacity: 0.03,
    linewidth: 0.5
  });
  const meshInner = new THREE.Mesh(geometryInner, materialInner);
  meshInner.position.z = -0.5;
  scene.add(meshInner);

  // Particle Field — Subtle tectonic dispersion
  const particlesCount = 300;
  const positions = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount * 3; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 25 + Math.random() * 15;
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xd8c3b0,
    size: 0.2,
    transparent: true,
    opacity: 0.18,
    sizeAttenuation: true
  });
  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // Cursor influence field — displaces particles slightly on mouse move
  const cursorInfluence = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    cursorInfluence.x = (e.clientX / window.innerWidth - 0.5) * 0.8;
    cursorInfluence.y = (e.clientY / window.innerHeight - 0.5) * 0.8;
  });

  // Light sources — subtle, static
  const ambientLight = new THREE.AmbientLight(0x181818, 0.3);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xd8c3b0, 0.15);
  dirLight1.position.set(10, 10, 10);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x48cae4, 0.12);
  dirLight2.position.set(-10, -10, 10);
  scene.add(dirLight2);

  // Animation Loop — with cursor influence
  let targetX = 0;
  let targetY = 0;
  let meshRotation = 0;

  function animate() {
    requestAnimationFrame(animate);

    mesh.rotation.y += 0.0012;
    mesh.rotation.x += 0.0008;
    meshInner.rotation.y -= 0.001;

    particleSystem.rotation.y -= 0.0003;
    particleSystem.rotation.x += 0.0002;

    // Cursor-influenced camera subtle pull
    targetX = cursorInfluence.x * 5;
    targetY = cursorInfluence.y * 5;
    camera.position.x += (targetX - camera.position.x) * 0.015;
    camera.position.y += (-targetY - camera.position.y) * 0.015;
    camera.lookAt(scene.position);

    // Rhythmic rotation pulse based on time
    const time = performance.now() / 1000;
    mesh.rotation.z = Math.sin(time * 0.3) * 0.02;

    renderer.render(scene, camera);
  }
  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
  });
}

// --------------------------------------------------------------------------
// 4. GSAP SCROLLTRIGGER & FLIP REVEAL ANIMATIONS — PREMIUM MOTION
// --------------------------------------------------------------------------
function initGSAPAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger, Flip);

  // Lean into 60fps/120fps ticker pacing
  gsap.ticker.fps(60);
  gsap.ticker.lagSmoothing(16, 4);

  // Hero Title & Meta Reveal on load
  gsap.from('.hero-title', {
    y: 50,
    opacity: 0,
    duration: 1.3,
    ease: 'power3.out',
    delay: 0.3
  });

  gsap.from('.hero-meta-badge', {
    y: 25,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    delay: 0.4
  });

  gsap.from('.hero-sub-grid', {
    y: 40,
    opacity: 0,
    duration: 1.1,
    ease: 'power3.out',
    delay: 0.5
  });

  // Section Headers Reveal — ScrollTrigger based
  gsap.utils.toArray('.section-label, .manifesto-heading, .portfolio-title-group, .principal-details h2').forEach(el => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 82%',
        toggleActions: 'play none none reverse',
        once: true
      },
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });
  });

  // Monograph Cards Flip Entry — with delay cascade
  const monographCards = document.querySelectorAll('.monograph-card');
  monographCards.forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
        once: true
      },
      y: 60,
      opacity: 0,
      rotationX: index % 2 === 0 ? -15 : 15,
      duration: 0.95,
      delay: (index % 4) * 0.12,
      ease: 'power3.out',
      flip: 'to_right_start'
    });
  });

  // Material Cards Hover Flip (3D Tilt)
  const materialCards = document.querySelectorAll('.material-card');
  materialCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      gsap.to(card, {
        rotateY: rotateX,
        rotateX: rotateY,
        scale: 1.02,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        scale: 1,
        duration: 0.6,
        ease: 'power2.out'
      });
    });
  });

  // Principal Portrait Hover Tilt
  const portraitWrapper = document.querySelector('.principal-portrait-wrapper');
  if (portraitWrapper) {
    portraitWrapper.addEventListener('mousemove', (e) => {
      const rect = portraitWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 25;
      const rotateY = (centerX - x) / 25;

      gsap.to(portraitWrapper.querySelector('img'), {
        rotateX: rotateX,
        rotateY: rotateY,
        scale: 1.03,
        duration: 0.5,
        ease: 'power2.out'
      });
    });

    portraitWrapper.addEventListener('mouseleave', () => {
      gsap.to(portraitWrapper.querySelector('img'), {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.6,
        ease: 'power2.out'
      });
    });
  }

  // Smooth page transition FLIP on nav link clicks (Barba.js-style without full SPA)
  document.querySelectorAll('a.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      // Allow normal anchor navigation; GSAP will animate the section into view
      const targetId = link.getAttribute('href');
      if (targetId.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const currentSection = document.querySelector('main > section.active');
          if (currentSection) {
            Flip.from(currentSection, {
              duration: 0.75,
              ease: 'power2.inOut',
              onComplete: () => {
                window.scrollTo({
                  top: targetElement.offsetTop - 80,
                  behavior: 'smooth'
                });
              }
            });
          } else {
            window.scrollTo({
              top: targetElement.offsetTop - 80,
              behavior: 'smooth'
            });
          }
        }
      }
    });
  });
}

// --------------------------------------------------------------------------
// 5. MONOGRAPH DATA ENGINE & INTERACTIVE CASE STUDY DRAWER
// --------------------------------------------------------------------------
const monographsData = {
  parnaiba: {
    id: "parnaiba",
    title: "Residência Santana de Parnaíba",
    subtitle: "Monolithic Courtyard Residence with Integrated Solar Orientation",
    category: "residential",
    year: "2013",
    location: "Santana de Parnaíba, SP",
    area: "850 m²",
    heroImage: "mass_arquitetura/images/DVQ70yhEYC3.jpg",
    gallery: [
      "mass_arquitetura/images/DVQ70yhEYC3.jpg",
      "mass_arquitetura/images/DVdjhKBDVM2.jpg",
      "mass_arquitetura/images/DVbIwduDZhl.jpg",
      "mass_arquitetura/images/DVYdH4bEeDT_0.jpg",
      "mass_arquitetura/images/DVYdH4bEeDT_1.jpg",
      "mass_arquitetura/images/DUqNMjcEQd9_0.jpg"
    ],
    description: `Organizada rigorosamente em dois pavimentos com orientação solar norte privilegiada, a Residência Santana de Parnaíba estabelece uma transição contínua entre a ala social e o jardim privativo. Caixilhos em alumínio de piso ao teto recolhem-se inteiramente nas alvenarias, transformando o amplo living em uma varanda habitável com controle térmico e luz abundante.`,
    specs: [
      { label: "Estrutura", val: "Concreto Armado Protendido & Alvenaria Estrutural" },
      { label: "Caixilharia", val: "Alumínio Anodizado Preto Sol-a-Pino (@jmaresquadrias)" },
      { label: "Materialidade", val: "Lambri de Ipê, Cerâmica Portobello & Textura Terracor" },
      { label: "Mobiliário", val: "Tora Brasil, Carlos Motta, Artesian, Empório Beraldin" },
      { label: "Iluminação", val: "Arquitetura de Luz LABLUZ / Goe Light / Reka" },
      { label: "Fotografia", val: "Ana Mello (@anamello) | Paisagismo: Daniela Ramalho" }
    ],
    blueprintSvg: `<svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="400" fill="#040a10"/>
      <grid width="800" height="400" stroke="rgba(0,180,216,0.1)" stroke-width="1"/>
      <rect x="100" y="80" width="600" height="240" stroke="#00b4d8" stroke-width="2" stroke-dasharray="4 4" fill="rgba(0,180,216,0.02)"/>
      <!-- Outer Walls -->
      <path d="M120 100 H680 V300 H120 Z" stroke="#00b4d8" stroke-width="3"/>
      <!-- Courtyard -->
      <rect x="320" y="140" width="200" height="120" stroke="#48cae4" stroke-dasharray="2 2" fill="rgba(72,202,228,0.05)"/>
      <text x="375" y="205" fill="#48cae4" font-family="monospace" font-size="12">PÁTIO NORTE</text>
      <!-- Rooms -->
      <line x1="280" y1="100" x2="280" y2="300" stroke="#00b4d8" stroke-width="2"/>
      <text x="180" y="200" fill="#90e0ef" font-family="monospace" font-size="11">SUÍTES (5X)</text>
      <text x="560" y="200" fill="#90e0ef" font-family="monospace" font-size="11">LIVING & TERRAÇO</text>
      <circle cx="280" cy="200" r="4" fill="#00b4d8"/>
      <!-- Compass -->
      <path d="M730 60 L730 30 M730 30 L725 38 M730 30 L735 38" stroke="#00b4d8" stroke-width="2"/>
      <text x="726" y="22" fill="#00b4d8" font-family="monospace" font-size="10">N</text>
    </svg>`
  },

  quiririm: {
    id: "quiririm",
    title: "Residência em Quiririm",
    subtitle: "Modular Tectonic Steel Frame at Mantiqueira Foothills",
    category: "residential",
    year: "2016",
    location: "Taubaté, SP — Serra da Mantiqueira",
    area: "380 m²",
    heroImage: "mass_arquitetura/images/DVyQa7XkaZf.jpg",
    gallery: [
      "mass_arquitetura/images/DVyQa7XkaZf.jpg"
    ],
    description: `Implantada em um lote de 12x26m na Serra da Mantiqueira, a edificação foi concebida sob uma malha estrutural metálica modular de 4x4m. O volume térreo linear abriga os espaços sociais integrados voltados para a paisagem poente, enquanto o pavilhão superior revestido em painéis termoacústicos guarda as áreas íntimas.`,
    specs: [
      { label: "Estrutura", val: "Aço Laminado Gerdau em Modulação Rítmica 4x4m" },
      { label: "Fechamentos", val: "Telhas Termoacústicas & Alvenaria Pintada" },
      { label: "Conforto", val: "Brises Orientáveis para Proteção Solar Poente" },
      { label: "Sustentabilidade", val: "Ventilação Cruzada Passiva & Iluminação Zenital" }
    ],
    blueprintSvg: `<svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="400" fill="#040a10"/>
      <!-- 4x4 Grid -->
      <path d="M100 100 H700 M100 180 H700 M100 260 H700 M100 340 H700" stroke="rgba(0,180,216,0.15)" stroke-width="1"/>
      <path d="M100 100 V340 M250 100 V340 M400 100 V340 M550 100 V340 M700 100 V340" stroke="rgba(0,180,216,0.15)" stroke-width="1"/>
      <!-- Steel Columns -->
      <rect x="245" y="175" width="10" height="10" fill="#00b4d8"/>
      <rect x="395" y="175" width="10" height="10" fill="#00b4d8"/>
      <rect x="545" y="175" width="10" height="10" fill="#00b4d8"/>
      <text x="320" y="70" fill="#48cae4" font-family="monospace" font-size="12">MÓDULO ESTRUTURAL 4X4M</text>
    </svg>`
  },

  sc: {
    id: "sc",
    title: "Estudo Residência Santa Catarina",
    subtitle: "Oceanfront Glulam & Fair-Faced Concrete Architecture",
    category: "concepts",
    year: "2025",
    location: "Governador Celso Ramos, SC",
    area: "620 m²",
    heroImage: "mass_arquitetura/images/DVMDgyrEaGv_0.jpg",
    gallery: [
      "mass_arquitetura/images/DVMDgyrEaGv_0.jpg",
      "mass_arquitetura/images/DVMDgyrEaGv_1.jpg"
    ],
    description: `Investigação sobre a sustentabilidade tectônica no litoral catarinense. O projeto articula uma estrutura mista de concreto armado e Madeira Laminada Colada (MLC), onde os caixilhos deslizam para dentro de cavidades nas paredes para dissipar os limites entre interior e paisagem nativa.`,
    specs: [
      { label: "Estrutura Mista", val: "Concreto C40 + Vigas de Madeira Laminada Colada (MLC)" },
      { label: "Vidros", val: "Vidros Low-E Dupos com Atenuação Térmica Operável" },
      { label: "Parceria", val: "Mass Arquitetura + Norea De Vitto" },
      { label: "Visualização", val: "Studio Lion 3D (@studiolion.3d)" }
    ],
    blueprintSvg: `<svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="400" fill="#040a10"/>
      <path d="M100 280 C250 250, 450 310, 700 260" stroke="#00b4d8" stroke-width="2" stroke-dasharray="4 4"/>
      <text x="120" y="320" fill="#48cae4" font-family="monospace" font-size="11">PERFIL TOPOGRÁFICO COSTEIRO</text>
    </svg>`
  },

  corporativo: {
    id: "corporativo",
    title: "Espaço Comercial & Corporativo",
    subtitle: "Adaptive Reuse & Structural Glazing Facade",
    category: "corporate",
    year: "2013",
    location: "Jardins, São Paulo, SP",
    area: "450 m²",
    heroImage: "mass_arquitetura/images/DVGvRGAEZr1_0.jpg",
    gallery: [
      "mass_arquitetura/images/DVGvRGAEZr1_0.jpg",
      "mass_arquitetura/images/DVGvRGAEZr1_1.jpg",
      "mass_arquitetura/images/DVGvRGAEZr1_2.jpg"
    ],
    description: `Conversão tectônica de uma residência urbana em sede corporativa para empresa de automação de alto padrão. A intervenção preservou os elementos portantes existentes e adicionou uma pele de vidro Structural Glazing que amplia a luminosidade interna e reflete os jardins externos.`,
    specs: [
      { label: "Fachada", val: "Pele de Vidro Structural Glazing com Filtro UV" },
      { label: "Sistemas", val: "Automação Integrada & Climatização VRF Inverter" },
      { label: "Fotografia", val: "Pedro Coltro (@pedrocoltro)" }
    ],
    blueprintSvg: `<svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="400" fill="#040a10"/>
      <rect x="200" y="80" width="400" height="240" stroke="#00b4d8" stroke-width="2"/>
      <line x1="200" y1="80" x2="600" y2="320" stroke="rgba(0,180,216,0.2)"/>
      <text x="310" y="200" fill="#00b4d8" font-family="monospace" font-size="12">STRUCTURAL GLAZING RETROFIT</text>
    </svg>`
  },

  ipojuca: {
    id: "ipojuca",
    title: "Residência Vila Ipojuca",
    subtitle: "Narrow-Lot Topographical Precision",
    category: "residential",
    year: "2014",
    location: "Vila Ipojuca, São Paulo, SP",
    area: "310 m²",
    heroImage: "mass_arquitetura/images/DUvlV_IkSed_0.jpg",
    gallery: [
      "mass_arquitetura/images/DUvlV_IkSed_0.jpg",
      "mass_arquitetura/images/DUvlV_IkSed_1.jpg"
    ],
    description: `Solução para um lote estreito (6x30m) com aclive desafiador. A residência organiza-se em patamares em meios-níveis para otimizar a movimentação de terra, canalizando a iluminação e ventilação natural pelas fachadas frontal e fundos.`,
    specs: [
      { label: "Lote", val: "6.00m x 30.00m sem recuos laterais" },
      { label: "Estratégia", val: "Meios-níveis com iluminação zênital central" }
    ],
    blueprintSvg: `<svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="400" fill="#040a10"/>
      <path d="M150 300 L300 240 L450 180 L600 120" stroke="#00b4d8" stroke-width="3"/>
      <text x="300" y="340" fill="#48cae4" font-family="monospace" font-size="11">PATAMARES TOPOGRÁFICOS EM MEIOS-NÍVEIS</text>
    </svg>`
  },

  perdizes: {
    id: "perdizes",
    title: "Reforma Apartamento Perdizes",
    subtitle: "High-Craft Wooden Joinery & Tactile Interiors",
    category: "residential",
    year: "2025",
    location: "Perdizes, São Paulo, SP",
    area: "240 m²",
    heroImage: "mass_arquitetura/images/DUsue6ykRFj_0.jpg",
    gallery: [
      "mass_arquitetura/images/DUsue6ykRFj_0.jpg",
      "mass_arquitetura/images/DUsue6ykRFj_1.jpg",
      "mass_arquitetura/images/DUsue6ykRFj_2.jpg"
    ],
    description: `Renovação de interiores integrando estar, jantar e gastronomia através de marcenaria autoral em painéis de Ipê maciço. Os painéis camuflam portas pivotantes e garantem conforto acústico sofisticado.`,
    specs: [
      { label: "Marcenaria", val: "Painéis de Ipê Maciço (@artlacapm)" },
      { label: "Revestimentos", val: "Mármore Grigio (@graniston.marmoraria)" },
      { label: "Iluminação", val: "LABLUZ Arquitetura de Luz" },
      { label: "Visualização 3D", val: "Studio Lion 3D (@studiolion.3d)" }
    ],
    blueprintSvg: `<svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="400" fill="#040a10"/>
      <rect x="250" y="100" width="300" height="200" fill="rgba(0,180,216,0.05)" stroke="#00b4d8" stroke-width="2"/>
      <line x1="250" y1="100" x2="250" y2="300" stroke="#48cae4" stroke-width="6"/>
      <text x="290" y="200" fill="#00b4d8" font-family="monospace" font-size="12">PAINEL PIVOTANTE IPÊ</text>
    </svg>`
  }
};

// Monograph Engine Initialization
function initMonographEngine() {
  const modal = document.getElementById('monograph-modal');
  if (!modal) return;

  const closeBtn = modal.querySelector('.modal-close-btn');

  // Open Monograph Trigger
  document.querySelectorAll('[data-monograph]').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const id = card.getAttribute('data-monograph');
      if (monographsData[id]) {
        // Stop Lenis during modal open
        if (lenis) lenis.stop();
        
        openMonographModal(monographsData[id]);
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMonographModal);
  }

  // Close on Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMonographModal();
  });

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeMonographModal();
    }
  });
}

function openMonographModal(data) {
  const modal = document.getElementById('monograph-modal');
  if (!modal) return;

  // Populate data
  document.getElementById('modal-title').textContent = data.title;
  document.getElementById('modal-subtitle').textContent = data.subtitle;
  document.getElementById('modal-meta').textContent = `${data.location} — ${data.year} // ${data.area}`;

  // Populate Description with animated fade
  const descPanel = document.getElementById('modal-tab-desc');
  if (descPanel) {
    gsap.from(descPanel, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: 'power2.out',
      delay: 0.1
    });
    descPanel.innerHTML = `
      <p style="font-size: 1.1rem; line-height: 1.8; color: var(--text-secondary); margin-bottom: 32px;">${data.description}</p>
    `;
  }

  // Populate Specs Table with staggered entries
  const specsTable = document.getElementById('modal-specs-table');
  if (specsTable) {
    const specsHtml = data.specs.map((s, i) => `
      <tr>
        <th style="transition: opacity 0.2s ${i * 0.05}s;">${s.label}</th>
        <td style="transition: opacity 0.2s ${i * 0.05}s + 0.1s;">${s.val}</td>
      </tr>
    `).join('');
    specsTable.innerHTML = specsHtml;
    
    // Animate table rows in
    gsap.from('.specs-table tr', {
      opacity: 0,
      y: 12,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out'
    });
  }

  // Populate Gallery with hover zoom
  const galleryGrid = document.getElementById('modal-gallery-grid');
  if (galleryGrid) {
    galleryGrid.innerHTML = data.gallery.map(imgSrc => `
      <div class="modal-gallery-item">
        <img src="${imgSrc}" alt="${data.title}" loading="lazy"/>
      </div>
    `).join('');
    
    // Add hover zoom effect to gallery images
    const modalImgs = galleryGrid.querySelectorAll('img');
    modalImgs.forEach(img => {
      img.style.transition = 'transform 0.5s var(--ease-out-expo)';
      img.style.transform = 'scale(1)';
      
      img.addEventListener('mouseenter', () => {
        gsap.to(img, { scale: 1.15, duration: 0.4, ease: 'power2.out' });
      });
      img.addEventListener('mouseleave', () => {
        gsap.to(img, { scale: 1, duration: 0.4, ease: 'power2.out' });
      });
    });
  }

  // Populate Blueprint SVG
  const blueprintWrapper = document.getElementById('modal-blueprint-svg');
  if (blueprintWrapper) {
    blueprintWrapper.innerHTML = data.blueprintSvg;
    
    // Animate blueprint lines on load
    const svg = blueprintWrapper.querySelector('svg');
    if (svg) {
      const paths = svg.querySelectorAll('path, line, rect, circle, text');
      paths.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transition = `opacity 0.4s ${i * 0.06}s`;
        el.style.transitionProperty = 'opacity';
      });
      
      gsap.from(paths, {
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power2.out',
        duration: 0.8
      });
    }
  }

  // Show Modal & Lock Scroll
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Reset Tab to 'desc'
  switchTab('desc');
}

function closeMonographModal() {
  const modal = document.getElementById('monograph-modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  if (lenis) lenis.start();
}

// Tab Switching with GSAP animation
function switchTab(tabId) {
  const allBtns = document.querySelectorAll('.tab-btn');
  const allPanels = document.querySelectorAll('.tab-panel');
  
  // Animate button state change
  gsap.to(allBtns, {
    opacity: 0.4,
    pointerEvents: 'none',
    duration: 0.15,
    ease: 'none'
  });
  
  setTimeout(() => {
    allBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
      btn.style.opacity = '';
      btn.style.pointerEvents = '';
    });
    
    allPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-panel-${tabId}`);
    });
    
    // Force reflow for animation
    const activePanel = document.getElementById(`tab-panel-${tabId}`);
    if (activePanel) {
      gsap.from(activePanel, { opacity: 0, y: 12, duration: 0.4, ease: 'power2.out' });
    }
  }, 150);
}

// Attach Tab Listeners
document.addEventListener('click', (e) => {
  if (e.target.matches('.tab-btn')) {
    const tabId = e.target.getAttribute('data-tab');
    switchTab(tabId);
  }
});

// --------------------------------------------------------------------------
// 6. FILTER SYSTEM — ENHANCED WITH GSAP ANIMATIONS & SMOOTH CARD MORPH
// --------------------------------------------------------------------------
function initFilterSystem() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.monograph-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Active state with gsap scale
      filterBtns.forEach(b => {
        gsap.to(b, { scale: 0.95, duration: 0.2, ease: 'power2.out' });
        b.classList.remove('active');
      });
      
      gsap.to(btn, { scale: 1.05, duration: 0.2, ease: 'power2.out' });
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          // Use GSAP for display toggle instead of inline style
          card.style.display = 'block';
          gsap.fromTo(card, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' });
        } else {
          gsap.to(card, { opacity: 0, y: -20, duration: 0.35, ease: 'power2.in', onComplete: () => {
            card.style.display = 'none';
            card.style.opacity = '';
            card.style.transform = '';
          }});
        }
      });
    });
  });
}

// --------------------------------------------------------------------------
// 7. MATERIALITY SHOWCASE INTERACTIVE — ENHANCED WITH 3D TILT & PERSISTENT STATE
// --------------------------------------------------------------------------
function initMaterialityShowcase() {
  const matCards = document.querySelectorAll('.material-card');
  matCards.forEach(card => {
    card.addEventListener('click', () => {
      matCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      
      // Add tactile feedback pulse
      card.style.transition = 'none';
      card.offsetHeight; // trigger reflow
      card.style.transition = 'box-shadow 0.3s, transform 0.3s';
      card.style.boxShadow = '0 0 0 1px var(--accent-cyan), 0 8px 32px rgba(0,0,0,0.4)';
      
      setTimeout(() => {
        card.style.boxShadow = '';
      }, 300);
    });
    
    // Hover tilt already handled in CSS/GSAP, ensure persistent active state
    card.addEventListener('mouseleave', () => {
      if (!card.classList.contains('active')) {
        gsap.to(card, { borderColor: 'var(--border-subtle)', transform: 'translateY(0)', duration: 0.3 });
      }
    });
  });
}

// --------------------------------------------------------------------------
// 8. PRIVATE CONSULTATION MODAL — ENHANCED WITH FORM VALIDATION & SMOOTH INTERACTIONS
// --------------------------------------------------------------------------
function initConsultationModal() {
  const modal = document.getElementById('consultation-modal');
  const openBtns = document.querySelectorAll('.trigger-consultation');
  const closeBtn = document.getElementById('close-consultation-btn');

  if (!modal) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    });
  }

  // Handle Form Submission with validation
  const form = document.getElementById('consultation-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Simple client-side validation
      const clientName = document.getElementById('clientName').value.trim();
      const clientEmail = document.getElementById('clientEmail').value.trim();
      const projectDetails = document.getElementById('projectDetails').value.trim();
      
      let valid = true;
      
      if (!clientName) {
        gsap.shake(document.getElementById('clientName'));
        valid = false;
      }
      if (!clientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
        gsap.shake(document.getElementById('clientEmail'));
        valid = false;
      }
      if (!projectDetails) {
        gsap.shake(document.getElementById('projectDetails'));
        valid = false;
      }
      
      if (valid) {
        // Subtle success animation
        gsap.to(modal, { 
          opacity: 0, 
          duration: 0.4, 
          ease: 'power2.in',
          onComplete: () => {
            modal.classList.remove('open');
            document.body.style.overflow = '';
            if (lenis) lenis.start();
            
            // Success state
            alert('Thank you for your inquiry. Mass Arquitetura principal office will contact you within 24 hours.');
            
            // Reset form
            form.reset();
          }
        });
      }
    });
  }
}

// --------------------------------------------------------------------------
// 9. SMOOTH PAGE TRANSITIONS BETWEEN SECTIONS USING GSAP FLIP
// --------------------------------------------------------------------------
function initSmoothPageTransitions() {
  // Observe nav link clicks for section transitions
  document.querySelectorAll('a.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          // Get current active section
          const currentSections = document.querySelectorAll('main > section');
          const currentActive = document.querySelector('main > section.active');
          
          if (currentActive && currentActive !== targetElement) {
            // FLIP animation between sections
            Flip.from(currentActive, {
              type: 'x',
              duration: 0.85,
              ease: 'power2.inOut',
              onComplete: () => {
                // Scroll to target
                window.scrollTo({
                  top: targetElement.offsetTop - 80,
                  behavior: 'auto'
                });
                
                // Mark target as active
                currentSections.forEach(s => s.classList.remove('active'));
                targetElement.classList.add('active');
              }
            });
          } else if (!currentActive) {
            // First load - just scroll
            window.scrollTo({
              top: targetElement.offsetTop - 80,
              behavior: 'auto'
            });
            targetElement.classList.add('active');
          }
        }
      }
    });
  });
  
  // Intersection Observer for auto-section active state on scroll
  const sections = document.querySelectorAll('main > section');
  const navLinks = document.querySelectorAll('.nav-link');
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
          sections.forEach(section => section.classList.remove('active'));
          entry.target.classList.add('active');
        }
      });
    },
    { 
      root: null, 
      threshold: 0.35,
      rootMargin: '-80px 0px 0px 0px' 
    }
  );
  
  sections.forEach(section => observer.observe(section));
}