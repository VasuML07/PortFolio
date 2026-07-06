/* =========================================
INITIALIZATION
========================================= */
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initCursor();
    initLenis();
    initThreeScene();
    initNavbar();
    initTyping();
    initTerminal();
    initTiltCards();
    initSpotlight();
    initMagnetic();
    initContributionGraph();
    initModal();
});

/* =========================================
LOADER
========================================= */
function initLoader() {
    const loader = document.getElementById('loader');
    const percentEl = document.getElementById('loader-percent');
    const fill = document.querySelector('.loader-fill');
    let percent = 0;
    
    const interval = setInterval(() => {
        percent += Math.random() * 15;
        if (percent >= 100) {
            percent = 100;
            clearInterval(interval);
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.classList.remove('loading');
                initAnimations();
            }, 500);
        }
        percentEl.textContent = Math.floor(percent);
        fill.style.width = `${percent}%`;
    }, 80);
}

/* =========================================
CUSTOM CURSOR
========================================= */
function initCursor() {
    if ('ontouchstart' in window) return;
    
    const dot = document.getElementById('cursor-dot');
    const outline = document.getElementById('cursor-outline');
    const ripple = document.getElementById('cursor-ripple');
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    });

    function animate() {
        outlineX += (mouseX - outlineX) * 0.15;
        outlineY += (mouseY - outlineY) * 0.15;
        outline.style.transform = `translate(${outlineX - 20}px, ${outlineY - 20}px)`;
        requestAnimationFrame(animate);
    }
    animate();

    const interactives = document.querySelectorAll('a, button, .project-card, .skill-capsule, .bento-card, .capability-card');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => outline.classList.add('hover'));
        el.addEventListener('mouseleave', () => outline.classList.remove('hover'));
    });

    window.addEventListener('click', (e) => {
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        ripple.classList.remove('active');
        void ripple.offsetWidth;
        ripple.classList.add('active');
    });
}

/* =========================================
SMOOTH SCROLL (LENIS)
========================================= */
function initLenis() {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) lenis.scrollTo(target);
        });
    });
}

/* =========================================
THREE.JS NEURAL BRAIN
========================================= */
function initThreeScene() {
    const container = document.getElementById('three-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = Math.random() * Math.PI * 2;
        const r = 2 + (Math.random() - 0.5) * 0.5;
        
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        const mix = (positions[i * 3 + 1] + r) / (2 * r);
        colors[i * 3] = 0.37 * (1 - mix) + 0.55 * mix;
        colors[i * 3 + 1] = 0.92 * (1 - mix) + 0.36 * mix;
        colors[i * 3 + 2] = 0.83 * (1 - mix) + 0.96 * mix;

        sizes[i] = Math.random() * 2 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: renderer.getPixelRatio() }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float uTime;
            uniform float uPixelRatio;
            
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                float offset = length(position) * 0.5;
                vec3 pos = position;
                pos.x += sin(uTime * 0.5 + offset) * 0.05;
                pos.y += cos(uTime * 0.4 + offset) * 0.05;
                pos.z += sin(uTime * 0.3 + offset) * 0.05;
                mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            void main() {
                float dist = length(gl_PointCoord - vec2(0.5));
                if (dist > 0.5) discard;
                float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
                gl_FragColor = vec4(vColor, alpha * 0.8);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];
    const lineColors = [];
    
    for (let i = 0; i < count; i += 15) {
        for (let j = i + 1; j < count; j += 15) {
            const dx = positions[i * 3] - positions[j * 3];
            const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
            const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < 0.8) {
                linePositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
                linePositions.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
                const alpha = 1 - dist / 0.8;
                lineColors.push(0.37, 0.92, 0.83, alpha);
                lineColors.push(0.55, 0.36, 0.96, alpha);
            }
        }
    }
    
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 4));
    
    const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    camera.position.z = 6;

    let mouseX = 0, mouseY = 0;
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();
        material.uniforms.uTime.value = elapsed;

        particles.rotation.y += 0.001;
        lines.rotation.y += 0.001;

        camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 1.5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    animate();

    const resizeObserver = new ResizeObserver(() => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    resizeObserver.observe(container);
}

/* =========================================
NAVBAR
========================================= */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const progress = document.getElementById('nav-progress');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Progress bar
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (currentScroll / docHeight) * 100;
        progress.style.width = `${scrollPercent}%`;

        // Hide/Show
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
            if (currentScroll > lastScroll) {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }
        } else {
            navbar.classList.remove('scrolled');
            navbar.classList.remove('hidden');
        }
        lastScroll = currentScroll;

        // Active link
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            if (currentScroll >= sectionTop) current = section.getAttribute('id');
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
        });
    });
}

/* =========================================
TYPING EFFECT
========================================= */
function initTyping() {
    const typingElement = document.querySelector('.typing-text');
    const roles = ['Machine Learning Engineer', 'AI Engineer', 'Backend Developer', 'AI Product Builder', 'Open Source Contributor'];
    let roleIndex = 0, charIndex = 0, isDeleting = false;

    function type() {
        const currentRole = roles[roleIndex];
        if (isDeleting) {
            typingElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            typeSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500;
        }
        setTimeout(type, typeSpeed);
    }
    type();
}

/* =========================================
TERMINAL TYPING
========================================= */
function initTerminal() {
    const cmdEl = document.querySelector('.typing-cmd');
    if (!cmdEl) return;
    const commands = ['npm run deploy', 'git push origin main', 'python train_model.py', 'docker build -t ai-app .'];
    let cmdIndex = 0, charIndex = 0;

    function typeCmd() {
        const currentCmd = commands[cmdIndex];
        cmdEl.textContent = currentCmd.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentCmd.length) {
            setTimeout(() => {
                charIndex = 0;
                cmdIndex = (cmdIndex + 1) % commands.length;
                cmdEl.textContent = '';
            }, 2000);
        } else {
            setTimeout(typeCmd, 100);
        }
    }
    setTimeout(typeCmd, 2500);
}

/* =========================================
TILT CARDS
========================================= */
function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
}

/* =========================================
SPOTLIGHT EFFECT
========================================= */
function initSpotlight() {
    const cards = document.querySelectorAll('.spotlight-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });
}

/* =========================================
MAGNETIC BUTTONS
========================================= */
function initMagnetic() {
    const magnetics = document.querySelectorAll('.magnetic');
    magnetics.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
            el.style.transition = 'transform 0.5s var(--ease-out-expo)';
        });
        el.addEventListener('mouseenter', () => {
            el.style.transition = 'none';
        });
    });
}

/* =========================================
CONTRIBUTION GRAPH
========================================= */
function initContributionGraph() {
    const graph = document.getElementById('github-graph');
    if (!graph) return;
    for (let i = 0; i < 52 * 7; i++) {
        const day = document.createElement('div');
        const level = Math.random();
        let color = 'var(--surface)';
        if (level > 0.85) color = 'var(--accent-primary)';
        else if (level > 0.7) color = 'rgba(94, 234, 212, 0.6)';
        else if (level > 0.5) color = 'rgba(94, 234, 212, 0.3)';
        else if (level > 0.3) color = 'rgba(94, 234, 212, 0.1)';
        day.className = 'contribution-day';
        day.style.backgroundColor = color;
        graph.appendChild(day);
    }
}

/* =========================================
MODAL
========================================= */
const projectData = {
    statvault: {
        title: 'StatVault AI',
        meta: 'Machine Learning • 2026',
        problem: 'Football analytics lacked real-time predictive capabilities for player profiling and match outcomes. Existing systems were either too slow or lacked interpretability.',
        solution: 'Engineered a production-ready ML subsystem using XGBoost and K-Means clustering on 5M+ data points. Implemented advanced feature engineering for sports metrics.',
        tech: ['Python', 'XGBoost', 'Scikit-learn', 'Pandas', 'Feature Engineering'],
        challenges: 'Handling sparse data and preventing overfitting on highly correlated football metrics. Ensuring low-latency inference for real-time applications.',
        lessons: 'Feature engineering is 80% of the work. Domain knowledge in sports analytics drastically improved model interpretability and performance.'
    },
    neural: {
        title: 'Neural Network From Scratch',
        meta: 'Deep Learning • 2026',
        problem: 'Understanding the mathematical foundations of deep learning requires building from first principles, not just using high-level frameworks.',
        solution: 'Implemented a fully connected neural network entirely from scratch using only NumPy. Built custom backpropagation, Adam optimizer, and modular layer architecture.',
        tech: ['Python', 'NumPy', 'Linear Algebra', 'Calculus', 'Adam Optimizer'],
        challenges: 'Implementing stable backpropagation without numerical instability. Optimizing matrix operations for performance without C++ extensions.',
        lessons: 'Deep understanding of chain rule and matrix calculus. Appreciation for the engineering optimizations in frameworks like PyTorch.'
    },
    fakejob: {
        title: 'Fake Job Detection',
        meta: 'NLP / Web App • 2025',
        problem: 'Recruitment fraud is a growing issue, with fraudulent job postings exploiting job seekers. Manual detection is impossible at scale.',
        solution: 'Built an NLP-powered application using TF-IDF vectorization and Logistic Regression to detect fraudulent job postings in real-time. Deployed via Streamlit.',
        tech: ['Python', 'Scikit-learn', 'TF-IDF', 'Streamlit', 'NLP'],
        challenges: 'Handling imbalanced datasets where fraudulent posts are a minority. Ensuring low false-positive rates to avoid flagging legitimate jobs.',
        lessons: 'Importance of precision vs recall trade-offs in real-world applications. Value of clean, production-ready deployment pipelines.'
    }
};

function initModal() {
    const modal = document.getElementById('project-modal');
    const backdrop = modal.querySelector('.modal-backdrop');
    const closeBtn = modal.querySelector('.modal-close');
    const body = document.getElementById('modal-body');

    document.querySelectorAll('.modal-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            const data = projectData[target];
            if (!data) return;

            body.innerHTML = `
                <h2>${data.title}</h2>
                <div class="modal-meta"><span>${data.meta}</span></div>
                <h3>The Problem</h3>
                <p>${data.problem}</p>
                <h3>The Solution</h3>
                <p>${data.solution}</p>
                <h3>Tech Stack</h3>
                <p>${data.tech.join(' • ')}</p>
                <h3>Challenges</h3>
                <p>${data.challenges}</p>
                <h3>Lessons Learned</h3>
                <p>${data.lessons}</p>
            `;

            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        });
    });

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    backdrop.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

/* =========================================
GSAP ANIMATIONS
========================================= */
function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
        .from('.status-badge', { y: 30, opacity: 0, duration: 0.8 })
        .from('.hero-title .line', { y: 100, opacity: 0, duration: 1, stagger: 0.1 }, '-=0.6')
        .from('.hero-typing', { y: 30, opacity: 0, duration: 0.8 }, '-=0.8')
        .from('.hero-desc', { y: 30, opacity: 0, duration: 0.8 }, '-=0.6')
        .from('.hero-actions', { y: 30, opacity: 0, duration: 0.8 }, '-=0.6')
        .from('.scroll-indicator', { opacity: 0, duration: 1 }, '-=0.4');

    // Section Headers
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, {
            scrollTrigger: { trigger: header, start: 'top 80%', toggleActions: 'play none none reverse' },
            y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out'
        });
    });

    // About
    gsap.from('.about-content', {
        scrollTrigger: { trigger: '.about-grid', start: 'top 70%', toggleActions: 'play none none reverse' },
        x: -50, opacity: 0, duration: 1, ease: 'power3.out'
    });
    gsap.from('.about-terminal', {
        scrollTrigger: { trigger: '.about-grid', start: 'top 70%', toggleActions: 'play none none reverse' },
        x: 50, opacity: 0, duration: 1, ease: 'power3.out'
    });

    // Counters
    document.querySelectorAll('.stat-val, .stat-number').forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        if (!target) return;
        ScrollTrigger.create({
            trigger: stat,
            start: 'top 85%',
            onEnter: () => {
                gsap.to(stat, {
                    innerHTML: target,
                    duration: 2,
                    snap: { innerHTML: 1 },
                    ease: 'power2.out'
                });
            },
            once: true
        });
    });

    // Capabilities
    gsap.from('.capability-card', {
        scrollTrigger: { trigger: '.capabilities-grid', start: 'top 80%', toggleActions: 'play none none reverse' },
        y: 60, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out'
    });

    // Projects
    gsap.from('.project-card', {
        scrollTrigger: { trigger: '.projects-grid', start: 'top 80%', toggleActions: 'play none none reverse' },
        y: 60, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out'
    });

    // Skills
    gsap.from('.skill-category', {
        scrollTrigger: { trigger: '.skills-grid', start: 'top 80%', toggleActions: 'play none none reverse' },
        y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out'
    });

    // Metrics
    gsap.from('.metric-card', {
        scrollTrigger: { trigger: '.metrics-grid', start: 'top 80%', toggleActions: 'play none none reverse' },
        y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out'
    });

    // Contact
    gsap.from('.bento-card', {
        scrollTrigger: { trigger: '.bento-grid', start: 'top 80%', toggleActions: 'play none none reverse' },
        y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out'
    });
}
