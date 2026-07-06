/* =========================================================
   AVINASH MARGANA — PORTFOLIO
   Handcrafted. No fabricated data.
   ========================================================= */

(() => {
  'use strict';

  /* ---------- UTILITIES ---------- */
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const debounce = (fn, w = 120) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), w); }; };
  const throttle = (fn, w = 16) => { let last = 0; return (...a) => { const n = performance.now(); if (n - last >= w) { last = n; fn(...a); } }; };
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  /* =========================================================
     1. AI BOOT SEQUENCE LOADER
  ========================================================= */
  function initBoot() {
    const log = $('#boot-log');
    const fill = $('#boot-fill');
    const percent = $('#boot-percent');
    const boot = $('#boot');

    const lines = [
      { t: 'Initializing Neural Runtime',       d: 260 },
      { t: 'Loading Projects',                  d: 220 },
      { t: 'Compiling Intelligence',            d: 240 },
      { t: 'Connecting Knowledge Graph',        d: 280 },
      { t: 'Building Embeddings',               d: 220 },
      { t: 'Rendering Experience',              d: 260 },
      { t: 'Calibrating Cursor Dynamics',       d: 180 },
      { t: 'Systems Nominal',                   d: 200, ok: true },
    ];

    let p = 0;
    const step = 100 / lines.length;

    const addLine = (text, ok = false) => {
      const el = document.createElement('div');
      el.className = 'boot-log-line';
      el.innerHTML = `<span class="dim">›</span> ${text}${ok ? ' <span class="ok">[ok]</span>' : ''}`;
      log.appendChild(el);
      requestAnimationFrame(() => el.classList.add('in'));
    };

    let i = 0;
    const tick = () => {
      if (i >= lines.length) {
        fill.style.width = '100%';
        percent.textContent = '100%';
        setTimeout(() => {
          boot.classList.add('hidden');
          document.body.classList.remove('loading');
          initAfterBoot();
        }, 500);
        return;
      }
      const line = lines[i++];
      addLine(line.t, line.ok);
      p = Math.min(100, Math.round(i * step));
      fill.style.width = p + '%';
      percent.textContent = p + '%';
      setTimeout(tick, line.d + Math.random() * 120);
    };
    setTimeout(tick, 400);
  }

  /* =========================================================
     2. CUSTOM CURSOR (with contextual labels)
  ========================================================= */
  function initCursor() {
    if (isTouch || prefersReduced) return;
    const dot = $('#cursor-dot');
    const outline = $('#cursor-outline');
    const ripple = $('#cursor-ripple');
    const label = $('#cursor-label');

    let mx = innerWidth / 2, my = innerHeight / 2;
    let ox = mx, oy = my;
    let currentMode = 'default'; // default | hover | morph | circle
    let currentLabel = '';

    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
    });

    const animate = () => {
      ox = lerp(ox, mx, 0.18);
      oy = lerp(oy, my, 0.18);
      outline.style.transform = `translate3d(${ox - 18}px, ${oy - 18}px, 0)`;
      if (currentLabel) {
        label.style.transform = `translate3d(${ox}px, ${oy + 34}px, 0)`;
      }
      requestAnimationFrame(animate);
    };
    animate();

    addEventListener('click', e => {
      ripple.style.left = e.clientX + 'px';
      ripple.style.top = e.clientY + 'px';
      ripple.classList.remove('active');
      void ripple.offsetWidth;
      ripple.classList.add('active');
    });

    const setMode = (mode) => {
      if (currentMode === mode) return;
      outline.classList.remove('hover', 'morph', 'circle');
      if (mode !== 'default') outline.classList.add(mode);
      currentMode = mode;
    };
    const setLabel = (text) => {
      if (currentLabel === text) return;
      currentLabel = text;
      if (text) {
        label.textContent = text;
        label.classList.add('visible');
      } else {
        label.classList.remove('visible');
      }
    };

    // Generic hover
    const hoverables = 'a, button, .project-card, .skill-capsule, .capability-card, .bento-card, .work-card, .timeline-card, .arsenal-card, .metric-card, .eco-node, .constellation-node';
    document.addEventListener('mouseenter', e => {
      const t = e.target.closest(hoverables);
      if (!t) return;
      const cursor = t.dataset.cursor;
      if (cursor) {
        setMode('morph');
        setLabel(cursor);
      } else {
        setMode('hover');
        setLabel('');
      }
    }, true);
    document.addEventListener('mouseleave', e => {
      const t = e.target.closest(hoverables);
      if (!t) return;
      setMode('default');
      setLabel('');
    }, true);

    // Image preview circle
    $$('img, .work-card-preview').forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (!el.dataset.cursor) { setMode('circle'); setLabel(''); }
      });
      el.addEventListener('mouseleave', () => {
        if (!el.dataset.cursor) { setMode('default'); }
      });
    });
  }

  /* =========================================================
     3. SHOOTING STARS
  ========================================================= */
  function initShootingStars() {
    if (prefersReduced) return;
    const layer = $('.bg-shooting');
    const spawn = () => {
      const s = document.createElement('div');
      s.className = 'shooting-star';
      s.style.top = Math.random() * 60 + '%';
      s.style.left = '-150px';
      s.style.animationDuration = (4 + Math.random() * 3) + 's';
      layer.appendChild(s);
      setTimeout(() => s.remove(), 8000);
    };
    setInterval(spawn, 5500);
    setTimeout(spawn, 1500);
  }

  /* =========================================================
     4. LENIS SMOOTH SCROLL
  ========================================================= */
  let lenis;
  function initLenis() {
    if (prefersReduced) return;
    lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (href.length < 2) return;
        const target = $(href);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -60, duration: 1.3 });
        }
      });
    });
  }

  /* =========================================================
     5. NAVBAR
  ========================================================= */
  function initNav() {
    const nav = $('#nav');
    const progress = $('#nav-progress');
    const links = $$('.nav-link');
    const sections = $$('section[id]');
    const menu = $('#nav-menu');
    const mobile = $('#nav-mobile');

    let lastY = 0;
    const onScroll = () => {
      const y = window.pageYOffset;
      const docH = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = ((y / docH) * 100) + '%';

      if (y > 40) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
      if (y > 200 && y > lastY) nav.classList.add('hide'); else nav.classList.remove('hide');
      lastY = y;

      // Active link
      let current = '';
      sections.forEach(s => {
        if (y >= s.offsetTop - 220) current = s.id;
      });
      links.forEach(l => {
        l.classList.toggle('active', l.dataset.section === current);
      });
    };
    addEventListener('scroll', throttle(onScroll, 60), { passive: true });
    onScroll();

    // Mobile
    menu?.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      mobile?.classList.toggle('open', open);
      menu.setAttribute('aria-expanded', open);
    });
    $$('.nav-mobile-link').forEach(l => l.addEventListener('click', () => {
      menu.classList.remove('open');
      mobile.classList.remove('open');
    }));
  }

  /* =========================================================
     6. HERO — TYPED ROLES
  ========================================================= */
  function initTyped() {
    const el = $('#hero-typed');
    if (!el) return;
    const roles = ['AI Engineer', 'ML Engineer', 'Backend Engineer', 'Problem Solver'];
    let ri = 0, ci = 0, deleting = false;

    const tick = () => {
      const role = roles[ri];
      if (deleting) {
        el.textContent = role.substring(0, ci - 1);
        ci--;
      } else {
        el.textContent = role.substring(0, ci + 1);
        ci++;
      }
      let delay = deleting ? 45 : 95;
      if (!deleting && ci === role.length) { deleting = true; delay = 2200; }
      else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 450; }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 900);
  }

  /* =========================================================
     7. THREE.JS — NEURAL BRAIN
  ========================================================= */
  function initBrain() {
    const container = $('#hero-brain');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particles
    const count = 2400;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 2 + (Math.random() - 0.5) * 0.6;
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const mix = (positions[i * 3 + 1] + r) / (2 * r);
      // gradient #64FFDA → #3B82F6 → #8B5CF6
      if (mix < 0.5) {
        const t = mix * 2;
        colors[i * 3]     = lerp(0.39, 0.23, t);
        colors[i * 3 + 1] = lerp(1.00, 0.51, t);
        colors[i * 3 + 2] = lerp(0.85, 0.96, t);
      } else {
        const t = (mix - 0.5) * 2;
        colors[i * 3]     = lerp(0.23, 0.55, t);
        colors[i * 3 + 1] = lerp(0.51, 0.36, t);
        colors[i * 3 + 2] = lerp(0.96, 0.96, t);
      }
      sizes[i] = Math.random() * 2 + 1;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        attribute float phase;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec3 pos = position;
          float pulse = 0.5 + 0.5 * sin(uTime * 1.2 + phase);
          vAlpha = 0.55 + pulse * 0.45;
          pos *= 1.0 + sin(uTime * 0.6 + phase) * 0.03;
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * uPixelRatio * (300.0 / -mv.z) * (0.85 + pulse * 0.3);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float a = 1.0 - smoothstep(0.15, 0.5, d);
          gl_FragColor = vec4(vColor, a * vAlpha * 0.9);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Connections
    const linePos = [];
    const lineCol = [];
    for (let i = 0; i < count; i += 18) {
      for (let j = i + 1; j < count; j += 18) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 0.75) {
          linePos.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
          );
          const a = 1 - dist / 0.75;
          lineCol.push(0.39, 1.00, 0.85, a * 0.6, 0.55, 0.36, 0.96, a * 0.6);
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
    lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineCol, 4));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // Mouse interaction
    let mx = 0, my = 0;
    container.addEventListener('mousemove', e => {
      const r = container.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width) * 2 - 1;
      my = -((e.clientY - r.top) / r.height) * 2 + 1;
    });

    const clock = new THREE.Clock();
    let frames = 0, lastFpsTime = 0;
    const fpsEl = $('#hero-fps');

    const animate = () => {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      mat.uniforms.uTime.value = t;

      points.rotation.y += 0.0012;
      lines.rotation.y += 0.0012;
      points.rotation.x = Math.sin(t * 0.2) * 0.05;
      lines.rotation.x = points.rotation.x;

      camera.position.x += (mx * 1.4 - camera.position.x) * 0.04;
      camera.position.y += (my * 1.4 - camera.position.y) * 0.04;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);

      frames++;
      if (t - lastFpsTime >= 1) {
        if (fpsEl) fpsEl.textContent = frames + 'fps';
        frames = 0;
        lastFpsTime = t;
      }
    };
    animate();

    const ro = new ResizeObserver(() => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    ro.observe(container);
  }

  /* =========================================================
     8. ABOUT TERMINAL — AUTO-TYPE
  ========================================================= */
  function initTerminal() {
    const body = $('#terminal-body');
    if (!body) return;

    const outputs = {
      whoami: 'avinash_margana',
      profile: `{
  <span class="key">"name"</span>: <span class="str">"Avinash Margana"</span>,
  <span class="key">"role"</span>: <span class="str">"AI/ML Engineer"</span>,
  <span class="key">"education"</span>: <span class="str">"B.Tech CSE (AI/ML), VIT-AP"</span>,
  <span class="key">"year"</span>: <span class="num">3</span>,
  <span class="key">"focus"</span>: [<span class="str">"Generative AI"</span>, <span class="str">"Open Source"</span>, <span class="str">"GATE"</span>]
}`,
      focus: `<span class="str">predictive-analytics/</span>  <span class="str">deep-learning/</span>  <span class="str">nlp/</span>
<span class="str">computer-vision/</span>     <span class="str">open-source/</span>     <span class="str">research/</span>`,
    };

    const cmds = $$('.term-cmd', body);
    const outs = $$('.term-out', body);

    const typeCmd = async (el, text) => {
      for (let i = 0; i < text.length; i++) {
        el.textContent += text[i];
        await new Promise(r => setTimeout(r, 35 + Math.random() * 35));
      }
    };

    const run = async () => {
      for (let i = 0; i < cmds.length; i++) {
        const cmd = cmds[i].dataset.cmd;
        if (!cmd) continue;
        await typeCmd(cmds[i], cmd);
        await new Promise(r => setTimeout(r, 250));
        if (outs[i] && outputs[cmd]) {
          outs[i].innerHTML = outputs[cmd];
        }
        await new Promise(r => setTimeout(r, 700));
      }
    };

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          run();
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });
    io.observe(body);

    // Copy button
    $('#terminal-copy')?.addEventListener('click', () => {
      const text = `avinash@neural-os:~ $ whoami\navinash_margana\n$ cat profile.json\n${JSON.stringify({
        name: 'Avinash Margana',
        role: 'AI/ML Engineer',
        education: 'B.Tech CSE (AI/ML), VIT-AP',
        year: 3,
        focus: ['Generative AI', 'Open Source', 'GATE']
      }, null, 2)}`;
      navigator.clipboard?.writeText(text);
    });
  }

  /* =========================================================
     9. SKILLS CONSTELLATION
  ========================================================= */
  function initConstellation() {
    const wrap = $('#constellation');
    const nodesEl = $('#constellation-nodes');
    const linesEl = $('#constellation-lines');
    if (!wrap || !nodesEl || !linesEl) return;

    const skills = [
      { id: 'python',     label: 'Python',          x: 50, y: 50, core: true },
      { id: 'pytorch',    label: 'PyTorch',         x: 28, y: 32 },
      { id: 'tf',         label: 'TensorFlow',      x: 72, y: 32 },
      { id: 'numpy',      label: 'NumPy',           x: 18, y: 55 },
      { id: 'pandas',     label: 'Pandas',          x: 82, y: 55 },
      { id: 'sklearn',    label: 'Scikit-learn',    x: 30, y: 72 },
      { id: 'dl',         label: 'Deep Learning',   x: 50, y: 22 },
      { id: 'nlp',        label: 'NLP',             x: 70, y: 72 },
      { id: 'cv',         label: 'Computer Vision', x: 15, y: 82 },
      { id: 'xgb',        label: 'XGBoost',         x: 88, y: 78 },
      { id: 'git',        label: 'Git',             x: 10, y: 22 },
      { id: 'streamlit',  label: 'Streamlit',       x: 90, y: 22 },
    ];

    const edges = [
      ['python','pytorch'],['python','tf'],['python','numpy'],['python','pandas'],
      ['python','sklearn'],['python','xgb'],['python','nlp'],['python','cv'],
      ['pytorch','dl'],['tf','dl'],['numpy','sklearn'],['pandas','sklearn'],
      ['sklearn','xgb'],['dl','nlp'],['dl','cv'],['nlp','streamlit'],
      ['cv','pytorch'],['git','python'],['streamlit','python'],
    ];

    const nodeEls = {};
    skills.forEach(s => {
      const n = document.createElement('div');
      n.className = 'constellation-node' + (s.core ? ' core' : '');
      n.textContent = s.label;
      n.style.left = s.x + '%';
      n.style.top = s.y + '%';
      n.dataset.id = s.id;
      nodesEl.appendChild(n);
      nodeEls[s.id] = n;
    });

    const drawLines = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      linesEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
      linesEl.innerHTML = '';
      edges.forEach(([a, b]) => {
        const na = nodeEls[a], nb = nodeEls[b];
        if (!na || !nb) return;
        const x1 = na.offsetLeft + na.offsetWidth / 2;
        const y1 = na.offsetTop + na.offsetHeight / 2;
        const x2 = nb.offsetLeft + nb.offsetWidth / 2;
        const y2 = nb.offsetTop + nb.offsetHeight / 2;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1); line.setAttribute('y1', y1);
        line.setAttribute('x2', x2); line.setAttribute('y2', y2);
        line.dataset.a = a; line.dataset.b = b;
        linesEl.appendChild(line);
      });
    };
    drawLines();
    addEventListener('resize', debounce(drawLines, 200));

    // Hover highlight
    Object.entries(nodeEls).forEach(([id, el]) => {
      el.addEventListener('mouseenter', () => {
        $$('line', linesEl).forEach(l => {
          if (l.dataset.a === id || l.dataset.b === id) l.classList.add('active');
        });
      });
      el.addEventListener('mouseleave', () => {
        $$('line.active', linesEl).forEach(l => l.classList.remove('active'));
      });
    });
  }

  /* =========================================================
     10. AI ECOSYSTEM
  ========================================================= */
  function initEcosystem() {
    const wrap = $('#eco');
    const nodesEl = $('#eco-nodes');
    const linesEl = $('#eco-lines');
    if (!wrap || !nodesEl || !linesEl) return;

    const nodes = [
      { id: 'ml',   label: 'Machine Learning',  desc: 'Classical algorithms',      x: 50, y: 8,  core: true },
      { id: 'dl',   label: 'Deep Learning',     desc: 'Neural architectures',      x: 50, y: 22 },
      { id: 'cv',   label: 'Computer Vision',   desc: 'CNNs · Detection',          x: 25, y: 38 },
      { id: 'nlp',  label: 'NLP',               desc: 'Text · Transformers',       x: 75, y: 38 },
      { id: 'llm',  label: 'LLMs',              desc: 'Large language models',     x: 75, y: 55 },
      { id: 'rag',  label: 'RAG',               desc: 'Retrieval pipelines',       x: 50, y: 68 },
      { id: 'ag',   label: 'Agents',            desc: 'Autonomous workflows',      x: 25, y: 55 },
      { id: 'mlops',label: 'MLOps',             desc: 'Pipelines · Versioning',    x: 25, y: 82 },
      { id: 'dep',  label: 'Deployment',        desc: 'Serving · Monitoring',      x: 75, y: 82 },
    ];

    const edges = [
      ['ml','dl'],['dl','cv'],['dl','nlp'],['nlp','llm'],
      ['llm','rag'],['rag','ag'],['ag','mlops'],['mlops','dep'],
      ['cv','mlops'],['dl','rag'],
    ];

    const nodeEls = {};
    nodes.forEach(n => {
      const el = document.createElement('div');
      el.className = 'eco-node' + (n.core ? ' core' : '');
      el.style.left = n.x + '%';
      el.style.top = n.y + '%';
      el.dataset.id = n.id;
      el.innerHTML = `<div class="eco-node-label">${n.label}</div><div class="eco-node-desc">${n.desc}</div>`;
      nodesEl.appendChild(el);
      nodeEls[n.id] = el;
    });

    const draw = () => {
      linesEl.innerHTML = '';
      edges.forEach(([a, b]) => {
        const na = nodeEls[a], nb = nodeEls[b];
        if (!na || !nb) return;
        const x1 = na.offsetLeft + na.offsetWidth / 2;
        const y1 = na.offsetTop + na.offsetHeight / 2;
        const x2 = nb.offsetLeft + nb.offsetWidth / 2;
        const y2 = nb.offsetTop + nb.offsetHeight / 2;
        const W = wrap.clientWidth, H = wrap.clientHeight;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        path.setAttribute('d', `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`);
        path.setAttribute('viewBox', `0 0 ${W} ${H}`);
        path.dataset.a = a; path.dataset.b = b;
        linesEl.appendChild(path);
      });
    };
    draw();
    addEventListener('resize', debounce(draw, 200));

    Object.entries(nodeEls).forEach(([id, el]) => {
      el.addEventListener('mouseenter', () => {
        $$('path', linesEl).forEach(p => {
          if (p.dataset.a === id || p.dataset.b === id) p.classList.add('active');
        });
      });
      el.addEventListener('mouseleave', () => {
        $$('path.active', linesEl).forEach(p => p.classList.remove('active'));
      });
    });
  }

  /* =========================================================
     11. PROJECT MODAL
  ========================================================= */
  const projectData = {
    statvault: {
      title: 'StatVault AI',
      meta: ['Machine Learning', '2026', 'Production ML'],
      problem: 'Football analytics lacked real-time predictive capabilities for player profiling and match outcomes. Existing systems were either too slow or lacked interpretability.',
      solution: 'Engineered a production-ready ML subsystem using XGBoost and K-Means clustering on 5M+ data points. Implemented advanced feature engineering tailored for sports metrics.',
      stack: ['Python', 'XGBoost', 'Scikit-learn', 'Pandas', 'Feature Engineering'],
      challenges: [
        'Handling sparse data and preventing overfitting on highly correlated football metrics.',
        'Ensuring low-latency inference for real-time applications.',
        'Designing features that are both predictive and interpretable for analysts.',
      ],
      architecture: [
        'Data ingestion pipeline → 5M+ match and player records.',
        'Feature engineering → domain-specific metrics (form, xG, pressure indices).',
        'Model training → XGBoost for match outcomes, K-Means for player profiling.',
        'Serving → low-latency inference interface.',
      ],
      lessons: 'Feature engineering is 80% of the work. Domain knowledge in sports analytics drastically improved model interpretability and performance.',
      repo: 'https://github.com/sai-ganesh-4539/StatVault/tree/feature/statvault-ml-updates',
    },
    neural: {
      title: 'Neural Network From Scratch',
      meta: ['Deep Learning', '2026', 'From First Principles'],
      problem: 'Understanding the mathematical foundations of deep learning requires building from first principles — not just using high-level frameworks.',
      solution: 'Implemented a fully connected neural network entirely from scratch using only NumPy. Built custom backpropagation, Adam optimizer, and a modular layer architecture.',
      stack: ['Python', 'NumPy', 'Linear Algebra', 'Calculus', 'Adam Optimizer'],
      challenges: [
        'Implementing stable backpropagation without numerical instability.',
        'Optimizing matrix operations for performance without C++ extensions.',
        'Designing a clean, modular API that mirrors PyTorch-style layer composition.',
      ],
      architecture: [
        'Modular layer abstraction — Dense, Activation, Loss.',
        'Custom forward / backward pass per layer.',
        'Adam optimizer implemented from the original paper.',
        'Numerical stability via gradient clipping and careful initialization.',
      ],
      lessons: 'Deep understanding of the chain rule and matrix calculus. A new appreciation for the engineering optimizations inside frameworks like PyTorch.',
      repo: 'https://github.com/VasuML07/NeuralNetworkfromscratch',
    },
    fakejob: {
      title: 'Fake Job Detection',
      meta: ['NLP', 'Web App', '2025', 'Live Deployment'],
      problem: 'Recruitment fraud is a growing issue — fraudulent job postings exploit job seekers at scale. Manual detection is impossible.',
      solution: 'Built an NLP-powered application using TF-IDF vectorization and Logistic Regression to detect fraudulent job postings in real-time. Deployed live via Streamlit.',
      stack: ['Python', 'Scikit-learn', 'TF-IDF', 'Streamlit', 'NLP'],
      challenges: [
        'Handling imbalanced datasets where fraudulent posts are the minority.',
        'Ensuring low false-positive rates to avoid flagging legitimate jobs.',
        'Designing a clean, production-ready deployment pipeline.',
      ],
      architecture: [
        'Text preprocessing → cleaning, tokenization, stopword removal.',
        'TF-IDF vectorization → sparse feature representation.',
        'Logistic Regression → calibrated probabilities.',
        'Streamlit UI → real-time inference for end users.',
      ],
      lessons: 'The importance of precision vs recall trade-offs in real-world applications. The value of clean, production-ready deployment pipelines.',
      repo: 'https://fakeprediction-a8wpvpp3uifhwxeduehaev.streamlit.app/',
      live: 'https://fakeprediction-a8wpvpp3uifhwxeduehaev.streamlit.app/',
    },
  };

  function initModal() {
    const modal = $('#modal');
    const body = $('#modal-body');
    const close = () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    const open = (key) => {
      const d = projectData[key];
      if (!d) return;
      body.innerHTML = `
        <h2>${d.title}</h2>
        <div class="modal-meta">${d.meta.map(m => `<span>${m}</span>`).join('')}</div>

        <h3>The Problem</h3>
        <p>${d.problem}</p>

        <h3>The Solution</h3>
        <p>${d.solution}</p>

        <h3>Tech Stack</h3>
        <div class="modal-stack">${d.stack.map(s => `<span>${s}</span>`).join('')}</div>

        <h3>Architecture</h3>
        <ul>${d.architecture.map(a => `<li>${a}</li>`).join('')}</ul>

        <h3>Challenges</h3>
        <ul>${d.challenges.map(c => `<li>${c}</li>`).join('')}</ul>

        <h3>Lessons Learned</h3>
        <p>${d.lessons}</p>

        <div class="modal-links">
          ${d.repo ? `<a class="modal-link" href="${d.repo}" target="_blank" rel="noopener">Repository →</a>` : ''}
          ${d.live ? `<a class="modal-link" href="${d.live}" target="_blank" rel="noopener">Live Demo →</a>` : ''}
        </div>
      `;
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    $$('.work-open').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const card = btn.closest('.work-card');
        open(card.dataset.project);
      });
    });

    $('#modal-backdrop').addEventListener('click', close);
    $('#modal-close').addEventListener('click', close);
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* =========================================================
     12. MAGNETIC BUTTONS
  ========================================================= */
  function initMagnetic() {
    if (isTouch) return;
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform .6s var(--ease)';
        el.style.transform = 'translate(0,0)';
        setTimeout(() => el.style.transition = '', 600);
      });
      el.addEventListener('mouseenter', () => el.style.transition = 'none');
    });
  }

  /* =========================================================
     13. TILT CARDS (subtle)
  ========================================================= */
  function initTilt() {
    if (isTouch) return;
    $$('.work-card, .metric-card, .arsenal-card, .timeline-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(1000px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* =========================================================
     14. SPOTLIGHT ON CARDS
  ========================================================= */
  function initSpotlight() {
    if (isTouch) return;
    $$('.work-card, .capability-card, .contact-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');
      });
    });
  }

  /* =========================================================
     15. SCROLL REVEAL
  ========================================================= */
  function initReveal() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    $$('.section-title, .section-sub, .section-label, .work-card, .arsenal-card, .metric-card, .timeline-item, .contact-card').forEach(el => {
      el.classList.add('reveal');
      io.observe(el);
    });
    $$('.arsenal-grid, .metrics-grid, .work-list').forEach(el => {
      el.classList.add('reveal-stagger');
      io.observe(el);
    });
  }

  /* =========================================================
     16. SPLIT TYPE (for character reveal on titles)
  ========================================================= */
  function initSplit() {
    if (typeof SplitType === 'undefined') return;
    $$('[data-split]').forEach(el => {
      new SplitType(el, { types: 'chars,words', tagName: 'span' });
    });
  }

  /* =========================================================
     17. GSAP HERO ENTRANCE
  ========================================================= */
  function initHeroAnim() {
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero-status', { y: 20, opacity: 0, duration: .8 }, .2)
      .from('.hero-line', { y: 60, opacity: 0, duration: 1, stagger: .12 }, .35)
      .from('.hero-desc', { y: 20, opacity: 0, duration: .8 }, 1)
      .from('.hero-actions .btn', { y: 20, opacity: 0, duration: .7, stagger: .08 }, 1.1)
      .from('.hero-meta-item, .hero-meta-divider', { y: 16, opacity: 0, duration: .6, stagger: .08 }, 1.3)
      .from('.hero-right', { opacity: 0, scale: .95, duration: 1.2 }, .6)
      .from('.hero-float', { y: 20, opacity: 0, duration: .8, stagger: .1 }, 1.4)
      .from('.hero-scroll', { opacity: 0, duration: 1 }, 1.6);
  }

  /* =========================================================
     18. METRICS — LIVE GITHUB & LEETCODE
     Graceful fallback: shows "—" if fetch fails. No fake data.
  ========================================================= */
  async function initMetrics() {
    // GitHub
    try {
      const res = await fetch('https://api.github.com/users/VasuML07');
      if (res.ok) {
        const d = await res.json();
        animateCount($('#gh-repos'), d.public_repos || 0);
        animateCount($('#gh-followers'), d.followers || 0);
        // Stars: sum across repos
        const reposRes = await fetch('https://api.github.com/users/VasuML07/repos?per_page=100');
        if (reposRes.ok) {
          const repos = await reposRes.json();
          const stars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
          animateCount($('#gh-stars'), stars);
        }
      }
    } catch (e) { /* keep "—" */ }

    // LeetCode (GraphQL, may be blocked by CORS — graceful fallback)
    try {
      const res = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query userProfile($username: String!) {
            matchedUser(username: $username) {
              submitStatsGlobal { acSubmissionNum { difficulty count } }
              userCalendar { streak }
            }
            userContestRanking(username: $username) { rating attendedContestsCount }
          }`,
          variables: { username: 'coder_2028' },
        }),
      });
      if (res.ok) {
        const j = await res.json();
        const u = j.data?.matchedUser;
        const c = j.data?.userContestRanking;
        if (u) {
          const subs = u.submitStatsGlobal?.acSubmissionNum || [];
          const total = subs.find(s => s.difficulty === 'All')?.count || 0;
          const easy = subs.find(s => s.difficulty === 'Easy')?.count || 0;
          const med = subs.find(s => s.difficulty === 'Medium')?.count || 0;
          const hard = subs.find(s => s.difficulty === 'Hard')?.count || 0;
          animateCount($('#lc-solved'), total);
          $('#lc-easy-n').textContent = easy;
          $('#lc-medium-n').textContent = med;
          $('#lc-hard-n').textContent = hard;
          if (total > 0) {
            $('#lc-easy').style.width = (easy / total * 100) + '%';
            $('#lc-medium').style.width = (med / total * 100) + '%';
            $('#lc-hard').style.width = (hard / total * 100) + '%';
          }
        }
        if (c) {
          animateCount($('#lc-rating'), Math.round(c.rating || 0));
          animateCount($('#lc-contests'), c.attendedContestsCount || 0);
        }
      }
    } catch (e) { /* keep "—" */ }

    // Contribution graph — GitHub events API (public, last 90 days)
    try {
      const res = await fetch('https://api.github.com/users/VasuML07/events/public?per_page=100');
      if (res.ok) {
        const events = await res.json();
        const contrib = $('#gh-contrib');
        contrib.innerHTML = '';
        // Build a 52x7 grid, fill recent days based on event density
        const days = 52 * 7;
        const dayCounts = new Array(days).fill(0);
        const now = Date.now();
        events.forEach(ev => {
          const d = new Date(ev.created_at);
          const diff = Math.floor((now - d.getTime()) / 86400000);
          if (diff < 365) {
            const idx = days - 1 - diff;
            if (idx >= 0 && idx < days) dayCounts[idx]++;
          }
        });
        const max = Math.max(1, ...dayCounts);
        dayCounts.forEach(c => {
          const el = document.createElement('div');
          el.className = 'metric-day';
          if (c === 0) {}
          else if (c / max < 0.25) el.classList.add('l1');
          else if (c / max < 0.5) el.classList.add('l2');
          else if (c / max < 0.8) el.classList.add('l3');
          else el.classList.add('l4');
          contrib.appendChild(el);
        });
      }
    } catch (e) {
      const contrib = $('#gh-contrib');
      if (contrib) contrib.innerHTML = '<div class="metric-contrib-loading">Contribution graph unavailable.</div>';
    }
  }

  function animateCount(el, target) {
    if (!el) return;
    const start = performance.now();
    const dur = 1400;
    const from = 0;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (target - from) * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* =========================================================
     BOOT → INIT SEQUENCE
  ========================================================= */
  function initAfterBoot() {
    initLenis();
    initNav();
    initTyped();
    initBrain();
    initTerminal();
    initConstellation();
    initEcosystem();
    initModal();
    initMagnetic();
    initTilt();
    initSpotlight();
    initReveal();
    initSplit();
    initHeroAnim();
    initMetrics();
  }

  /* =========================================================
     ENTRY
  ========================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initShootingStars();
    initBoot();
  });
})();
