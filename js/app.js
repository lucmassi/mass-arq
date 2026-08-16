/* ==========================================================================
   MASS ARQUITETURA — SÃO PAULO // NEW YORK
   Interactive Engine & WebGL Shader Architecture
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLenisScroll();
  initCustomCursor();
  initWebGLBackground();
  initGSAPAnimations();
  initMonographEngine();
  initFilterSystem();
  initConsultationModal();
  initMaterialityShowcase();
});

/* --------------------------------------------------------------------------
   1. LENIS SMOOTH SCROLL INTEGRATION
   -------------------------------------------------------------------------- */
let lenis;
function initLenisScroll() {
  if (typeof Lenis !== 'undefined') {
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

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger if available
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
      const progress = (scrollY / totalHeight) * 100;
      progressBar.style.width = `${progress}%`;
    }
  });
}

/* --------------------------------------------------------------------------
   2. CUSTOM MAGNETIC CURSOR WITH LERP PHYSICS
   -------------------------------------------------------------------------- */
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const cursorText = cursor ? cursor.querySelector('.cursor-text') : null;

  if (!cursor) return;

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

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

  // Hover targets
  const hoverables = [
    { selector: '.monograph-card', text: 'VER PROJETO' },
    { selector: '.btn-cta', text: 'INICIAR' },
    { selector: '.material-card', text: 'SELECIONAR' },
    { selector: '.nav-link, .filter-btn', text: 'VER' },
    { selector: '.modal-close-btn', text: 'FECHAR' }
  ];

  hoverables.forEach(({ selector, text }) => {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('active');
        if (cursorText) cursorText.textContent = text;
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
        if (cursorText) cursorText.textContent = '';
      });
    });
  });
}

/* --------------------------------------------------------------------------
   3. THREE.JS WEBGL BACKGROUND CANVAS
   -------------------------------------------------------------------------- */
function initWebGLBackground() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Tectonic Architectural Wireframe Geometry
  const geometry = new THREE.IcosahedronGeometry(18, 2);
  const material = new THREE.MeshBasicMaterial({
    color: 0xd8c3b0,
    wireframe: true,
    transparent: true,
    opacity: 0.08
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Particle Field
  const particlesCount = 200;
  const positions = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 100;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xd8c3b0,
    size: 0.15,
    transparent: true,
    opacity: 0.3
  });
  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // Animation Loop
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 0.5;
    targetY = (e.clientY / window.innerHeight - 0.5) * 0.5;
  });

  function animate() {
    requestAnimationFrame(animate);

    mesh.rotation.x += 0.001;
    mesh.rotation.y += 0.0015;

    particleSystem.rotation.y -= 0.0005;

    camera.position.x += (targetX * 10 - camera.position.x) * 0.03;
    camera.position.y += (-targetY * 10 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* --------------------------------------------------------------------------
   4. GSAP SCROLLTRIGGER REVEAL ANIMATIONS
   -------------------------------------------------------------------------- */
function initGSAPAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Hero Title Reveal
  gsap.from('.hero-title', {
    y: 40,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
    delay: 0.2
  });

  gsap.from('.hero-meta-badge', {
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  gsap.from('.hero-sub-grid', {
    y: 30,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    delay: 0.4
  });

  // Section Headers Reveal
  gsap.utils.toArray('.section-label, .manifesto-heading, .portfolio-title-group').forEach(el => {
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

  // Monograph Cards Parallax Entry
  gsap.utils.toArray('.monograph-card').forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none reverse'
      },
      y: 50,
      opacity: 0,
      duration: 0.9,
      delay: (index % 3) * 0.15,
      ease: 'power3.out'
    });
  });
}

/* --------------------------------------------------------------------------
   5. MONOGRAPH DATA & INTERACTIVE CASE STUDY ENGINE
   -------------------------------------------------------------------------- */
const monographsData = {
  parnaiba: {
    id: "parnaiba",
    title: "Residência Santana de Parnaíba",
    subtitle: "Residência Monolítica com Pátio e Orientação Solar Integrada",
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
      { label: "Caixilharia", val: "Alumínio Anodizado Preto Sol-a-Pino (JMar Esquadrias)" },
      { label: "Materialidade", val: "Lambri de Ipê, Cerâmica Portobello & Textura Terracor" },
      { label: "Mobiliário", val: "Tora Brasil, Carlos Motta, Artesian, Empório Beraldin" },
      { label: "Iluminação", val: "Arquitetura de Luz LABLUZ / Goe Light / Reka" },
      { label: "Fotografia", val: "Ana Mello | Paisagismo: Daniela Ramalho" }
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
    subtitle: "Estrutura Metálica Modular na Mantiqueira",
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
    subtitle: "Arquitetura Costeira em MLC & Concreto à Vista",
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
      { label: "Visualização", val: "Studio Lion 3D" }
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
    subtitle: "Reutilização Adaptativa & Fachada Estrutural em Vidro",
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
      { label: "Fotografia", val: "Pedro Coltro" }
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
    subtitle: "Precisão Topográfica em Lote Estreito",
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
    subtitle: "Marcenaria Autoral em Ipê & Pedra Tátil",
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
      { label: "Marcenaria", val: "Painéis de Ipê Maciço (Artla Capm)" },
      { label: "Revestimentos", val: "Mármore Grigio (Graniston Marmoraria)" },
      { label: "Iluminação", val: "LABLUZ Arquitetura de Luz" },
      { label: "Visualização 3D", val: "Studio Lion 3D" }
    ],
    blueprintSvg: `<svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="400" fill="#040a10"/>
      <rect x="250" y="100" width="300" height="200" fill="rgba(0,180,216,0.05)" stroke="#00b4d8" stroke-width="2"/>
      <line x1="250" y1="100" x2="250" y2="300" stroke="#48cae4" stroke-width="6"/>
      <text x="290" y="200" fill="#00b4d8" font-family="monospace" font-size="12">PAINEL PIVOTANTE IPÊ</text>
    </svg>`
  }
};

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
        openMonographModal(monographsData[id]);
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMonographModal);
  }

  // Close on Escape or click backdrop
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMonographModal();
  });
}

function openMonographModal(data) {
  const modal = document.getElementById('monograph-modal');
  if (!modal) return;

  // Populate data
  document.getElementById('modal-title').textContent = data.title;
  document.getElementById('modal-subtitle').textContent = data.subtitle;
  document.getElementById('modal-meta').textContent = `${data.location} — ${data.year} // ${data.area}`;

  // Populate Description
  document.getElementById('modal-tab-desc').innerHTML = `
    <p style="font-size: 1.1rem; line-height: 1.8; color: var(--text-secondary); margin-bottom: 32px;">${data.description}</p>
  `;

  // Populate Specs Table
  const specsTable = document.getElementById('modal-specs-table');
  if (specsTable) {
    specsTable.innerHTML = data.specs.map(s => `
      <tr>
        <th>${s.label}</th>
        <td>${s.val}</td>
      </tr>
    `).join('');
  }

  // Populate Gallery
  const galleryGrid = document.getElementById('modal-gallery-grid');
  if (galleryGrid) {
    galleryGrid.innerHTML = data.gallery.map(imgSrc => `
      <div class="modal-gallery-item">
        <img src="${imgSrc}" alt="${data.title}" loading="lazy"/>
      </div>
    `).join('');
  }

  // Populate Blueprint SVG
  const blueprintWrapper = document.getElementById('modal-blueprint-svg');
  if (blueprintWrapper) {
    blueprintWrapper.innerHTML = data.blueprintSvg;
  }

  // Show Modal & Lock Scroll
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (lenis) lenis.stop();

  // Reset Tab
  switchTab('desc');
}

function closeMonographModal() {
  const modal = document.getElementById('monograph-modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  if (lenis) lenis.start();
}

// Tab Switching
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-panel-${tabId}`);
  });
}

// Attach Tab Listeners
document.addEventListener('click', (e) => {
  if (e.target.matches('.tab-btn')) {
    const tabId = e.target.getAttribute('data-tab');
    switchTab(tabId);
  }
});

/* --------------------------------------------------------------------------
   6. FILTER SYSTEM
   -------------------------------------------------------------------------- */
function initFilterSystem() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.monograph-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'block';
          gsap.fromTo(card, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   7. MATERIALITY SHOWCASE INTERACTION
   -------------------------------------------------------------------------- */
function initMaterialityShowcase() {
  const matCards = document.querySelectorAll('.material-card');
  matCards.forEach(card => {
    card.addEventListener('click', () => {
      matCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });
}

/* --------------------------------------------------------------------------
   8. PRIVATE CONSULTATION MODAL
   -------------------------------------------------------------------------- */
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

  // Handle Form Submission
  const form = document.getElementById('consultation-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Obrigado pelo seu inquérito. O escritório Mass Arquitetura entrará em contato em até 24 horas.');
      modal.classList.remove('open');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    });
  }
}
