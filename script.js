(() => {
  'use strict';

  // =========================================
  // UTILITIES & CACHE
  // =========================================
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  
  const Cache = {
    get: (key) => {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      try {
        const { data, ts } = JSON.parse(raw);
        if (Date.now() - ts < 30 * 60 * 1000) return data; // 30 mins
      } catch (e) { /* ignore parse errors */ }
      return null;
    },
    set: (key, data) => localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }))
  };

  // =========================================
  // LOADER & CURSOR
  // =========================================
  const initLoader = () => {
    setTimeout(() => {
      $('#loader').classList.add('hidden');
      document.body.classList.remove('loading');
      initAfterLoad();
    }, 2200);
  };

  const initCursor = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const dot = $('#cursor-dot'), outline = $('#cursor-outline');
    let mx = innerWidth / 2, my = innerHeight / 2, ox = mx, oy = my;
    
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    
    const animate = () => {
      ox = lerp(ox, mx, 0.15); oy = lerp(oy, my, 0.15);
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      outline.style.transform = `translate(${ox}px, ${oy}px)`;
      requestAnimationFrame(animate);
    };
    animate();

    const hoverables = 'a, button, .glass-card, .work-card';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(hoverables)) outline.classList.add('hover');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hoverables)) outline.classList.remove('hover');
    });
  };

  // =========================================
  // THREE.JS NEURAL BRAIN
  // =========================================
  const initBrain = () => {
    const canvas = $('#hero-brain');
    if (!canvas || typeof THREE === 'undefined') return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 6;
    
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const count = 1500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 2 + (Math.random() - 0.5) * 0.4;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      const mix = (positions[i * 3 + 1] + r) / (2 * r);
      colors[i * 3] = lerp(0.39, 0.55, mix);
      colors[i * 3 + 1] = lerp(1.00, 0.36, mix);
      colors[i * 3 + 2] = lerp(0.85, 0.96, mix);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Connections
    const linePos = [];
    for (let i = 0; i < count; i += 10) {
      for (let j = i + 1; j < count; j += 10) {
        const dx = positions[i*3] - positions[j*3];
        const dy = positions[i*3+1] - positions[j*3+1];
        const dz = positions[i*3+2] - positions[j*3+2];
        if (Math.sqrt(dx*dx + dy*dy + dz*dz) < 0.6) {
          linePos.push(positions[i*3], positions[i*3+1], positions[i*3+2], positions[j*3], positions[j*3+1], positions[j*3+2]);
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0x64FFDA, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending });
    scene.add(new THREE.LineSegments(lineGeo, lineMat));

    let mx = 0, my = 0;
    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width) * 2 - 1;
      my = -((e.clientY - r.top) / r.height) * 2 + 1;
    });

    const animate = () => {
      requestAnimationFrame(animate);
      points.rotation.y += 0.001;
      camera.position.x += (mx * 1.5 - camera.position.x) * 0.05;
      camera.position.y += (my * 1.5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };
    animate();

    new ResizeObserver(() => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }).observe(canvas);
  };

  // =========================================
  // TYPED ROLES
  // =========================================
  const initTyped = () => {
    const el = $('#typed-text');
    if (!el) return;
    const roles = ['AI Engineer', 'Machine Learning Engineer', 'Backend Developer', 'Open Source Contributor'];
    let ri = 0, ci = 0, del = false;
    
    const tick = () => {
      const role = roles[ri];
      el.textContent = role.substring(0, ci);
      ci += del ? -1 : 1;
      
      let delay = del ? 40 : 80;
      if (!del && ci === role.length + 1) { del = true; delay = 2000; }
      else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; delay = 400; }
      setTimeout(tick, delay);
    };
    tick();
  };

  // =========================================
  // DATA: SKILLS & PROJECTS
  // =========================================
  const skillsData = [
    { name: 'Python', desc: 'Core language for ML pipelines and backend systems.', projects: ['StatVault AI', 'Neural Net Scratch'] },
    { name: 'Machine Learning', desc: 'Predictive modeling, XGBoost, Scikit-learn.', projects: ['StatVault AI', 'Fake Job Detection'] },
    { name: 'Deep Learning', desc: 'Neural networks, backpropagation, Adam optimizer.', projects: ['Neural Net Scratch'] },
    { name: 'NLP', desc: 'TF-IDF, text classification, transformers.', projects: ['Fake Job Detection'] },
    { name: 'PyTorch', desc: 'Dynamic computation graphs for research.', projects: ['Research Prototypes'] },
    { name: 'TensorFlow', desc: 'Production-grade model deployment.', projects: ['Fake Job Detection'] },
    { name: 'NumPy', desc: 'Vectorized math and matrix operations.', projects: ['Neural Net Scratch'] },
    { name: 'Pandas', desc: 'Data manipulation and feature engineering.', projects: ['StatVault AI'] },
    { name: 'SQL', desc: 'Relational database querying and optimization.', projects: ['Backend Systems'] },
    { name: 'Docker', desc: 'Containerization for reproducible environments.', projects: ['Deployment Pipelines'] },
    { name: 'Linux', desc: 'System administration and shell scripting.', projects: ['Server Management'] },
    { name: 'Git', desc: 'Version control and collaborative workflows.', projects: ['All Projects'] },
    { name: 'React', desc: 'Interactive frontend interfaces.', projects: ['Web Dashboards'] },
    { name: 'Java', desc: 'Object-oriented systems and algorithms.', projects: ['GATE Preparation'] },
    { name: 'JavaScript', desc: 'Web interactivity and Node.js backend.', projects: ['Portfolio Site'] }
  ];

  const projectsData = [
    {
      id: 'statvault', title: 'StatVault AI', tags: ['Machine Learning', '2026'],
      desc: 'Production-ready ML subsystem powering football intelligence — predictive analytics and player profiling using XGBoost and K-Means clustering on 5M+ data points.',
      stack: ['Python', 'XGBoost', 'Scikit-learn', 'Pandas'],
      problem: 'Football analytics lacked real-time predictive capabilities for player profiling and match outcomes. Existing systems were either too slow or lacked interpretability.',
      solution: 'Engineered a production-ready ML subsystem using XGBoost and K-Means clustering on 5M+ data points. Implemented advanced feature engineering tailored for sports metrics.',
      architecture: ['Data ingestion pipeline → 5M+ match and player records.', 'Feature engineering → domain-specific metrics (form, xG, pressure indices).', 'Model training → XGBoost for match outcomes, K-Means for player profiling.', 'Serving → low-latency inference interface.'],
      challenges: ['Handling sparse data and preventing overfitting on highly correlated football metrics.', 'Ensuring low-latency inference for real-time applications.', 'Designing features that are both predictive and interpretable for analysts.'],
      future: 'Integrate deep learning sequence models (LSTMs) for player trajectory prediction and real-time match state tracking.',
      lessons: 'Feature engineering is 80% of the work. Domain knowledge in sports analytics drastically improved model interpretability and performance.',
      repo: 'https://github.com/sai-ganesh-4539/StatVault/tree/feature/statvault-ml-updates'
    },
    {
      id: 'neural', title: 'Neural Network From Scratch', tags: ['Deep Learning', '2026'],
      desc: 'A fully connected neural network implemented entirely from first principles using only NumPy. No frameworks — just mathematics, custom backpropagation, and the Adam optimizer.',
      stack: ['Python', 'NumPy', 'Linear Algebra', 'Calculus'],
      problem: 'Understanding the mathematical foundations of deep learning requires building from first principles — not just using high-level frameworks.',
      solution: 'Implemented a fully connected neural network entirely from scratch using only NumPy. Built custom backpropagation, Adam optimizer, and a modular layer architecture.',
      architecture: ['Modular layer abstraction — Dense, Activation, Loss.', 'Custom forward / backward pass per layer.', 'Adam optimizer implemented from the original paper.', 'Numerical stability via gradient clipping and careful initialization.'],
      challenges: ['Implementing stable backpropagation without numerical instability.', 'Optimizing matrix operations for performance without C++ extensions.', 'Designing a clean, modular API that mirrors PyTorch-style layer composition.'],
      future: 'Add GPU support via CuPy, implement Convolutional and Recurrent layers.',
      lessons: 'Deep understanding of the chain rule and matrix calculus. A new appreciation for the engineering optimizations inside frameworks like PyTorch.',
      repo: 'https://github.com/VasuML07/NeuralNetworkfromscratch'
    },
    {
      id: 'fakejob', title: 'Fake Job Detection', tags: ['NLP', 'Web App', '2025'],
      desc: 'NLP-powered application detecting fraudulent job postings in real-time. Built with TF-IDF vectorization, Logistic Regression, and deployed live via Streamlit.',
      stack: ['Python', 'Scikit-learn', 'TF-IDF', 'Streamlit'],
      problem: 'Recruitment fraud is a growing issue — fraudulent job postings exploit job seekers at scale. Manual detection is impossible.',
      solution: 'Built an NLP-powered application using TF-IDF vectorization and Logistic Regression to detect fraudulent job postings in real-time. Deployed live via Streamlit.',
      architecture: ['Text preprocessing → cleaning, tokenization, stopword removal.', 'TF-IDF vectorization → sparse feature representation.', 'Logistic Regression → calibrated probabilities.', 'Streamlit UI → real-time inference for end users.'],
      challenges: ['Handling imbalanced datasets where fraudulent posts are the minority.', 'Ensuring low false-positive rates to avoid flagging legitimate jobs.', 'Designing a clean, production-ready deployment pipeline.'],
      future: 'Migrate to Transformer-based models (BERT/RoBERTa) for contextual understanding of deceptive language.',
      lessons: 'The importance of precision vs recall trade-offs in real-world applications. The value of clean, production-ready deployment pipelines.',
      repo: 'https://github.com/VasuML07',
      live: 'https://fakeprediction-a8wpvpp3uifhwxeduehaev.streamlit.app/'
    }
  ];

  // =========================================
  // RENDER: SKILLS & PROJECTS
  // =========================================
  const renderSkills = () => {
    const grid = $('#skills-grid');
    if (!grid) return;
    
    // SVG Gradient Definition
    const svgDefs = `<svg width="0" height="0"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#64FFDA"/><stop offset="100%" stop-color="#8B5CF6"/></linearGradient></defs></svg>`;
    grid.insertAdjacentHTML('beforebegin', svgDefs);

    grid.innerHTML = skillsData.map(s => `
      <div class="skill-card glass-card reveal">
        <div class="skill-ring">
          <svg viewBox="0 0 60 60">
            <circle class="bg" cx="30" cy="30" r="24"/>
            <circle class="fg" cx="30" cy="30" r="24"/>
          </svg>
        </div>
        <div class="skill-info">
          <div class="skill-name">${s.name}</div>
          <div class="skill-level">Intermediate</div>
          <div class="skill-desc">${s.desc}</div>
        </div>
      </div>
    `).join('');
  };

  const renderProjects = () => {
    const list = $('#projects-list');
    if (!list) return;
    list.innerHTML = projectsData.map(p => `
      <div class="work-card glass-card reveal" data-id="${p.id}">
        <div class="work-card-preview"></div>
        <div class="work-card-body">
          <div class="work-meta">${p.tags.map(t => `<span class="work-tag">${t}</span>`).join('')}</div>
          <h3 class="work-title">${p.title}</h3>
          <p class="work-desc">${p.desc}</p>
          <div class="work-stack">${p.stack.map(s => `<span>${s}</span>`).join('')}</div>
          <button class="work-open magnetic" data-id="${p.id}">
            View Case Study
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  };

  // =========================================
  // MODAL
  // =========================================
  const initModal = () => {
    const modal = $('#modal'), body = $('#modal-body');
    const close = () => { modal.classList.remove('active'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
    
    const open = (id) => {
      const p = projectsData.find(x => x.id === id);
      if (!p) return;
      body.innerHTML = `
        <h2>${p.title}</h2>
        <div class="modal-stack">${p.stack.map(s => `<span>${s}</span>`).join('')}</div>
        <h3>The Problem</h3><p>${p.problem}</p>
        <h3>The Solution</h3><p>${p.solution}</p>
        <h3>Architecture</h3><ul>${p.architecture.map(a => `<li>${a}</li>`).join('')}</ul>
        <h3>Challenges</h3><ul>${p.challenges.map(c => `<li>${c}</li>`).join('')}</ul>
        <h3>Future Improvements</h3><p>${p.future}</p>
        <h3>Lessons Learned</h3><p>${p.lessons}</p>
        <div class="modal-links">
          ${p.repo ? `<a href="${p.repo}" target="_blank" rel="noopener" class="modal-link">Repository →</a>` : ''}
          ${p.live ? `<a href="${p.live}" target="_blank" rel="noopener" class="modal-link">Live Demo →</a>` : ''}
        </div>
      `;
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    document.addEventListener('click', e => {
      const btn = e.target.closest('.work-open');
      if (btn) open(btn.dataset.id);
    });
    $('#modal-close').addEventListener('click', close);
    $('.modal-backdrop').addEventListener('click', close);
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  };

  // =========================================
  // API: GITHUB
  // =========================================
  const fetchGitHub = async () => {
    const dash = $('#github-dashboard');
    const cached = Cache.get('gh_data');
    if (cached) return renderGitHub(cached, dash);

    try {
      const [userRes, reposRes] = await Promise.all([
        fetch('https://api.github.com/users/VasuML07'),
        fetch('https://api.github.com/users/VasuML07/repos?per_page=6&sort=updated')
      ]);
      
      if (!userRes.ok || !reposRes.ok) throw new Error('Rate limit or API error');
      
      const user = await userRes.json();
      const repos = await reposRes.json();
      
      const data = {
        avatar: user.avatar_url,
        name: user.name || 'Avinash Margana',
        bio: user.bio || 'AI/ML Engineer',
        repos: user.public_repos,
        followers: user.followers,
        topRepos: repos.filter(r => !r.fork).slice(0, 4)
      };
      
      Cache.set('gh_data', data);
      renderGitHub(data, dash);
    } catch (e) {
      dash.innerHTML = `<div class="dash-card glass-card" style="grid-column: 1/-1; text-align:center; color:var(--text-3); padding: 3rem;">GitHub data temporarily unavailable. Please check back later.</div>`;
    }
  };

  const renderGitHub = (data, dash) => {
    dash.innerHTML = `
      <div class="dash-card glass-card">
        <div class="dash-head">
          <img src="${data.avatar}" alt="GitHub Avatar" style="width:40px;height:40px;border-radius:50%;border:2px solid var(--accent);">
          <div>
            <h3>${data.name}</h3>
            <span>${data.bio}</span>
          </div>
        </div>
        <div class="dash-stats">
          <div class="dash-stat"><span class="dash-val">${data.repos}</span><span class="dash-label">Repositories</span></div>
          <div class="dash-stat"><span class="dash-val">${data.followers}</span><span class="dash-label">Followers</span></div>
        </div>
      </div>
      <div class="dash-card glass-card" style="grid-column: span 2;">
        <h3 style="font-family:var(--font-h); margin-bottom:1rem; font-size:1.1rem;">Pinned Repositories</h3>
        <div class="dash-repos">
          ${data.topRepos.map(r => `
            <a href="${r.html_url}" target="_blank" rel="noopener" class="dash-repo">
              <div class="dash-repo-name">${r.name}</div>
              <div class="dash-repo-desc">${r.description || 'No description provided.'}</div>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  };

  // =========================================
  // API: LEETCODE (CORS-RESILIENT)
  // =========================================
  const fetchLeetCode = async () => {
    const dash = $('#leetcode-dashboard');
    const cached = Cache.get('lc_data');
    if (cached) return renderLeetCode(cached, dash);

    // Public APIs to bypass LeetCode's strict CORS policy
    const endpoints = [
      'https://alfa-leetcode-api.onrender.com/coder_2028',
      'https://leetcode-stats-api.herokuapp.com/coder_2028',
      'https://leetcode-api-faisalshohag.vercel.app/coder_2028'
    ];

    let data = null;

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const json = await res.json();
        
        // Normalize response structures from different wrappers
        const total = json.totalSolved || json.solvedProblem || 0;
        if (total > 0 || json.easySolved !== undefined) {
          data = {
            total: total,
            easy: json.easySolved || 0,
            medium: json.mediumSolved || 0,
            hard: json.hardSolved || 0,
            rating: json.contestRating || json.rating || 'N/A',
            contests: json.contestAttend || json.attendedContestsCount || 'N/A',
            ranking: json.ranking || 'N/A'
          };
          break; // Success, exit loop
        }
      } catch (e) {
        continue; // Try next endpoint
      }
    }

    if (data) {
      Cache.set('lc_data', data);
      renderLeetCode(data, dash);
    } else {
      dash.innerHTML = `
        <div class="dash-card glass-card" style="grid-column: 1/-1; text-align:center; color:var(--text-3); padding: 3rem;">
          <p style="margin-bottom: 1rem;">Unable to fetch latest LeetCode data due to API restrictions.</p>
          <a href="https://leetcode.com/u/coder_2028/" target="_blank" rel="noopener" class="btn btn-ghost" style="display: inline-flex;">
            View LeetCode Profile →
          </a>
        </div>
      `;
    }
  };

  const renderLeetCode = (data, dash) => {
    dash.innerHTML = `
      <div class="dash-card glass-card">
        <div class="dash-head">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--grad);display:grid;place-items:center;font-weight:700;color:var(--bg-0);">LC</div>
          <div>
            <h3>coder_2028</h3>
            <span>Algorithmic Problem Solving</span>
          </div>
        </div>
        <div class="dash-stats">
          <div class="dash-stat"><span class="dash-val">${data.total}</span><span class="dash-label">Total Solved</span></div>
          <div class="dash-stat"><span class="dash-val">${data.ranking}</span><span class="dash-label">Global Ranking</span></div>
        </div>
      </div>
      <div class="dash-card glass-card">
        <h3 style="font-family:var(--font-h); margin-bottom:1rem; font-size:1.1rem;">Difficulty Breakdown</h3>
        <div style="display:flex;flex-direction:column;gap:.8rem;">
          <div><div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:.3rem;"><span>Easy</span><span>${data.easy}</span></div><div style="height:6px;background:var(--surface-2);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${data.total ? (data.easy/data.total)*100 : 0}%;background:#10b981;border-radius:3px;transition:width 1.5s var(--ease);"></div></div></div>
          <div><div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:.3rem;"><span>Medium</span><span>${data.medium}</span></div><div style="height:6px;background:var(--surface-2);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${data.total ? (data.medium/data.total)*100 : 0}%;background:#f59e0b;border-radius:3px;transition:width 1.5s var(--ease);"></div></div></div>
          <div><div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:.3rem;"><span>Hard</span><span>${data.hard}</span></div><div style="height:6px;background:var(--surface-2);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${data.total ? (data.hard/data.total)*100 : 0}%;background:#ef4444;border-radius:3px;transition:width 1.5s var(--ease);"></div></div></div>
        </div>
      </div>
      <div class="dash-card glass-card">
        <h3 style="font-family:var(--font-h); margin-bottom:1rem; font-size:1.1rem;">Contest History</h3>
        <div class="dash-stats">
          <div class="dash-stat"><span class="dash-val">${data.contests}</span><span class="dash-label">Attended</span></div>
          <div class="dash-stat"><span class="dash-val">${data.rating}</span><span class="dash-label">Rating</span></div>
        </div>
      </div>
    `;
  };

  // =========================================
  // ANIMATIONS & INTERACTIONS
  // =========================================
  const initAnimations = () => {
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Reveal on scroll
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    $$('.reveal').forEach(el => io.observe(el));

    // Terminal typing
    const termBody = $('.terminal-body');
    if (termBody) {
      const cmds = $$('.term-cmd', termBody);
      const outs = $$('.term-out', termBody);
      const type = async (el, text) => {
        for (let i = 0; i < text.length; i++) {
          el.textContent += text[i];
          await new Promise(r => setTimeout(r, 30 + Math.random() * 30));
        }
      };
      const run = async () => {
        for (let i = 0; i < cmds.length; i++) {
          await type(cmds[i], cmds[i].dataset.cmd);
          await new Promise(r => setTimeout(r, 300));
        }
      };
      const termIO = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { run(); termIO.disconnect(); }
      }, { threshold: 0.3 });
      termIO.observe(termBody);
    }

    // Magnetic buttons
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });

    // Spotlight on cards
    $$('.work-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  };

  const initNav = () => {
    const nav = $('#nav');
    addEventListener('scroll', () => {
      if (scrollY > 50) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
    }, { passive: true });
  };

  const initLenis = () => {
    if (typeof Lenis === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    const raf = (time) => { lenis.raf(time * 1000); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = $(a.getAttribute('href'));
        if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -80 }); }
      });
    });
  };

  // =========================================
  // INIT SEQUENCE
  // =========================================
  const initAfterLoad = () => {
    initLenis();
    initNav();
    initBrain();
    initTyped();
    renderSkills();
    renderProjects();
    initModal();
    initAnimations();
    
    // Fetch Live Data
    fetchGitHub();
    fetchLeetCode();
    
    // Auto-refresh every 30 minutes
    setInterval(() => {
      localStorage.removeItem('gh_data');
      localStorage.removeItem('lc_data');
      fetchGitHub();
      fetchLeetCode();
    }, 30 * 60 * 1000);
  };

  document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initLoader();
  });
})();
