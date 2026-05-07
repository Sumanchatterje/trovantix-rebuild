// Navigation scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Reveal animations
    const reveals = document.querySelectorAll('.reveal-up');
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add('active');
        }
    }
});

// Mobile menu toggle
document.querySelector('.hamburger').addEventListener('click', () => {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'rgba(3, 8, 38, 0.95)';
        navLinks.style.padding = '2rem 0';
        navLinks.style.borderBottom = '1px solid rgba(43, 77, 255, 0.2)';
    }
});

// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
const rootElement = document.documentElement;

// Check for saved theme preference or system preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    rootElement.setAttribute('data-theme', savedTheme);
} else {
    // Default to light mode as requested
    rootElement.setAttribute('data-theme', 'light');
}

themeToggle.addEventListener('click', () => {
    let currentTheme = rootElement.getAttribute('data-theme');
    let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    rootElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update Three.js if initialized
    if (window.updateThreeJSTheme) {
        window.updateThreeJSTheme(newTheme);
    }
});

// --------------------------------------------------------
// Three.js 3D Background Animation (Particles Network)
// --------------------------------------------------------
const initThreeJS = () => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isDarkMode ? 0x030826 : 0xf8fafc, 0.001);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 1000;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Particles Data
    const particleCount = 400; // Adjust for density
    const maxDistance = 200; // Connection distance

    // Geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Color palettes
    const colorDark = new THREE.Color(0x0a165e); // #0a165e
    const colorBright = new THREE.Color(0x2b4dff); // #2b4dff
    const colorWhite = new THREE.Color(0xffffff); // white

    // Initial positioning
    const particlesData = [];
    for (let i = 0; i < particleCount; i++) {
        const x = (Math.random() - 0.5) * 2500;
        const y = (Math.random() - 0.5) * 2500;
        const z = (Math.random() - 0.5) * 2500;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Velocity
        particlesData.push({
            velocity: new THREE.Vector3(-1 + Math.random() * 2, -1 + Math.random() * 2, -1 + Math.random() * 2),
            numConnections: 0
        });

        // Colors based on theme
        let mixedColor;
        const rand = Math.random();
        
        // Use darker colors for particles in light mode so they are visible
        const colorPrimaryDark = isDarkMode ? colorDark : new THREE.Color(0x1e293b); 
        const colorPrimaryBright = isDarkMode ? colorBright : new THREE.Color(0x2b4dff);
        const colorAccent = isDarkMode ? colorWhite : new THREE.Color(0x0a165e);

        if(rand < 0.3) mixedColor = colorPrimaryDark;
        else if (rand < 0.8) mixedColor = colorPrimaryBright;
        else mixedColor = colorAccent;

        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const pMaterial = new THREE.PointsMaterial({
        size: 5,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8
    });

    const particles = new THREE.Points(geometry, pMaterial);
    scene.add(particles);

    // AI Core Sphere
    const sphereGeometry = new THREE.SphereGeometry(250, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x0a165e,
        transparent: true,
        opacity: 0.4,
        wireframe: true
    });
    const coreSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(coreSphere);

    // Inner Glowing Core
    const innerSphereGeo = new THREE.SphereGeometry(150, 32, 32);
    const innerSphereMat = new THREE.MeshBasicMaterial({
        color: 0x2b4dff,
        transparent: true,
        opacity: 0.8
    });
    const innerSphere = new THREE.Mesh(innerSphereGeo, innerSphereMat);
    scene.add(innerSphere);

    // Core Glow
    const glowGeometry = new THREE.SphereGeometry(300, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x2b4dff,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending
    });
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowSphere);

    // Lines for connections
    const lineGeometry = new THREE.BufferGeometry();
    const maxLines = (particleCount * (particleCount - 1)) / 2;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);

    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage));

    const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.15
    });

    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(linesMesh);

    // Animation Loop
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.5;
        mouseY = (event.clientY - windowHalfY) * 0.5;
    });

    const animate = () => {
        requestAnimationFrame(animate);

        // Smooth camera movement based on mouse
        targetX = mouseX * 0.5;
        targetY = mouseY * 0.5;
        
        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (-targetY - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        let vertexpos = 0;
        let colorpos = 0;
        let numConnected = 0;

        for (let i = 0; i < particleCount; i++)
            particlesData[i].numConnections = 0;

        for (let i = 0; i < particleCount; i++) {
            const particleData = particlesData[i];

            // Update position
            positions[i * 3] += particleData.velocity.x;
            positions[i * 3 + 1] += particleData.velocity.y;
            positions[i * 3 + 2] += particleData.velocity.z;

            // Bounce off boundaries
            if (positions[i * 3 + 1] < -1250 || positions[i * 3 + 1] > 1250)
                particleData.velocity.y = -particleData.velocity.y;

            if (positions[i * 3] < -1250 || positions[i * 3] > 1250)
                particleData.velocity.x = -particleData.velocity.x;

            if (positions[i * 3 + 2] < -1250 || positions[i * 3 + 2] > 1250)
                particleData.velocity.z = -particleData.velocity.z;

            // Connect lines
            for (let j = i + 1; j < particleCount; j++) {
                const particleDataB = particlesData[j];

                const dx = positions[i * 3] - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < maxDistance) {
                    particleData.numConnections++;
                    particleDataB.numConnections++;

                    const alpha = 1.0 - dist / maxDistance;

                    linePositions[vertexpos++] = positions[i * 3];
                    linePositions[vertexpos++] = positions[i * 3 + 1];
                    linePositions[vertexpos++] = positions[i * 3 + 2];

                    linePositions[vertexpos++] = positions[j * 3];
                    linePositions[vertexpos++] = positions[j * 3 + 1];
                    linePositions[vertexpos++] = positions[j * 3 + 2];

                    // Determine line color (mix of primary bright and dark based on distance)
                    const lr = colorBright.r * alpha + colorDark.r * (1 - alpha);
                    const lg = colorBright.g * alpha + colorDark.g * (1 - alpha);
                    const lb = colorBright.b * alpha + colorDark.b * (1 - alpha);

                    lineColors[colorpos++] = lr;
                    lineColors[colorpos++] = lg;
                    lineColors[colorpos++] = lb;

                    lineColors[colorpos++] = lr;
                    lineColors[colorpos++] = lg;
                    lineColors[colorpos++] = lb;

                    numConnected++;
                }
            }
        }

        linesMesh.geometry.setDrawRange(0, numConnected * 2);
        linesMesh.geometry.attributes.position.needsUpdate = true;
        linesMesh.geometry.attributes.color.needsUpdate = true;
        particles.geometry.attributes.position.needsUpdate = true;

        // Slow rotation of entire scene
        scene.rotation.y += 0.001;
        coreSphere.rotation.x += 0.002;
        coreSphere.rotation.y += 0.003;
        innerSphere.rotation.y -= 0.005;

        // Pulsing glow
        const time = Date.now() * 0.001;
        glowSphere.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
        innerSphereMaterial = Math.sin(time) * 0.2 + 0.8;

        renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Function to update theme without reloading
    window.updateThreeJSTheme = (theme) => {
        const isDark = theme === 'dark';
        scene.fog.color.setHex(isDark ? 0x030826 : 0xf8fafc);
        
        // Update lines
        lineMaterial.opacity = isDark ? 0.15 : 0.05;
        
        // Since we randomize particle colors, a full refresh is complex. 
        // Changing the fog and lines opacity handles the majority of the background adaptation.
    };
};

// Magnetic Buttons
const initMagneticButtons = () => {
    const buttons = document.querySelectorAll('.btn-primary');
    
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate distance from center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;
            
            btn.style.transform = `translate(${deltaX * 10}px, ${deltaY * 10}px)`;
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.transition = 'transform 0.3s ease';
        });
        
        btn.addEventListener('mouseenter', () => {
            btn.style.transition = 'transform 0.1s ease';
        });
    });
};

// Initialize after load to ensure Three.js is ready
window.addEventListener('load', () => {
    initThreeJS();
    initMagneticButtons();
});
