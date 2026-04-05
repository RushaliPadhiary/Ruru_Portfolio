// Wait for GSAP core, plugins, and the DOM completely loaded
document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);

  // GLOBAL NAVIGATION SCROLL STATE
  const nav = document.querySelector(".glass-nav");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  });

  // LOADER ANIMATION 
  gsap.to(".loader-character", {
    y: -20,
    duration: 1.5,
    ease: "power1.inOut",
    yoyo: true,
    repeat: -1
  });

  window.addEventListener("load", () => {
    setTimeout(() => {
      gsap.to("#loader", {
        opacity: 0,
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
          document.getElementById("loader").style.display = "none";
          initHeroAnimations();
        }
      });
    }, 2500);
  });

  // INITIALIZE HERO ANIMATIONS 
  function initHeroAnimations() {
    // Breathing Animation
    gsap.to(".character-breathing-layer", {
      scaleY: 1.05,
      scaleX: 1.03,
      transformOrigin: "bottom center",
      duration: 2.5,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1
    });

    // Waving Frame-by-Frame Animation
    const heroCharImg = document.querySelector(".hero-character");
    const isMobileView = () => window.innerWidth <= 768;
    let isFrameOne = true;

    // Preload both sets of frames
    const secondFrameDesktop = new Image();
    secondFrameDesktop.src = "assets/images/blank_me.png";
    const mobileFrame1 = new Image();
    mobileFrame1.src = "assets/images/mobile_metwo.png";
    const mobileFrame2 = new Image();
    mobileFrame2.src = "assets/images/mobile_me.png";

    gsap.to({}, {
      duration: 0.3,
      repeat: -1,
      onRepeat: () => {
        isFrameOne = !isFrameOne;
        if (isMobileView()) {
          heroCharImg.src = isFrameOne ? "assets/images/mobile_metwo.png" : "assets/images/mobile_me.png";
        } else {
          heroCharImg.src = isFrameOne ? "assets/images/blank_metwo.png" : "assets/images/blank_me.png";
        }
      }
    });

    // Butterfly Flapping and Coordinated Orbital Animation
    const allButterflies = document.querySelectorAll(".butterfly");
    const butterflyFrames = [
      "assets/images/one.png",
      "assets/images/two.png",
      "assets/images/three.png",
      "assets/images/four.png"
    ];

    allButterflies.forEach((b, i) => {
      let frameIndex = i % 4; 
      gsap.to({}, {
        duration: 0.08, // Flapping speed
        repeat: -1,
        onRepeat: () => {
          frameIndex = (frameIndex + 1) % 4;
          b.src = butterflyFrames[frameIndex];
        }
      });
      // Initial defaults
      gsap.set(b, { xPercent: -50, yPercent: -50, scale: 0.55, opacity: 0 }); // Hide initially before fade-in
    });

    // Helper math function for criss-cross orbits
    function calcOrbit(angle, tiltAngle) {
      const rx = 380;
      const ry = 90;
      const xInit = Math.cos(angle) * rx;
      const yInit = Math.sin(angle) * ry;
      
      const c = Math.cos(tiltAngle);
      const s = Math.sin(tiltAngle);

      const x = xInit * c - yInit * s;
      const y = xInit * s + yInit * c;
      const zDepth = Math.sin(angle);
      return { x, y, zDepth };
    }

    const setupOrbit = (targetClass, tilt) => {
      document.querySelectorAll(targetClass).forEach((b, i) => {
        // Space them exactly 120 degrees apart (Math.PI * 2 / 3)
        // This guarantees perfect balance: no overlapping, and never all on one side.
        let orbitObj = { angle: i * (Math.PI * 2 / 3) }; 
        // Use a static speed for all butterflies on this orbit so they don't lap each other.
        // We slightly offset speed per orbit so the two orbits drift against each other organically.
        let speed = targetClass === ".b-orbit-1" ? 10 : 11; 
        
        // Initial fade-in 
        gsap.to(b, { opacity: 1, duration: 1 });
        
        gsap.to(orbitObj, {
          angle: orbitObj.angle + Math.PI * 2,
          duration: speed,
          repeat: -1,
          ease: "none",
          onUpdate: () => {
            const pos = calcOrbit(orbitObj.angle, tilt);
            // vertical bob
            pos.y += Math.sin(orbitObj.angle * 2 + i) * 20; 
            const scale = 0.55 + pos.zDepth * 0.15; // Decreased size 
            
            gsap.set(b, {
              x: pos.x,
              y: pos.y,
              scale: scale,
              zIndex: pos.zDepth < 0 ? 1 : 3
            });
          }
        });
      });
    };
    
    // Slanting from right-down to left-top (+ Math.PI / 6)
    setupOrbit(".b-orbit-1", Math.PI / 6); 
    
    // Slanting from left-down to right-top (- Math.PI / 6)
    setupOrbit(".b-orbit-2", -Math.PI / 6);

    // Integrated Continuous Typing Animation
    // First segment
    gsap.to(".hero-typing-left", {
      text: {
        value: "Hello ",
        delimiter: ""
      },
      duration: 1.2,
      ease: "none",
      onComplete: () => {
        // Move cursor gracefully to the second half
        document.querySelector(".hero-typing-left").classList.remove("typing-cursor");
        document.querySelector(".hero-typing-right").classList.add("typing-cursor");

        // Second segment
        gsap.to(".hero-typing-right", {
          text: {
            value: "I'm Rushali",
            delimiter: ""
          },
          duration: 2.2,
          ease: "none",
          onComplete: () => {

            // Cascade the hero subtext naturally
            gsap.to(".hero-headline", {
              opacity: 1,
              y: -10,
              duration: 0.8,
              ease: "power2.out"
            });
            gsap.to(".hero-body p", {
              opacity: 1,
              y: -10,
              duration: 0.8,
              stagger: 0.2,
              ease: "power2.out",
              delay: 0.2
            });
          }
        });
      }
    });

    // Eye Tracking Logic (Character-anchored, immune to viewport shifts)
    const pupils = document.querySelectorAll(".hero-pupil");
    const charImg = document.querySelector(".hero-character");
    const isMobile = () => window.innerWidth <= 768;

    // Cache anchor positions relative to the character image
    // We recompute on resize only — NOT on every mousemove
    let eyeAnchors = [];

    function computeEyeAnchors() {
      eyeAnchors = [];
      const charRect = charImg.getBoundingClientRect();
      pupils.forEach((pupil) => {
        const rect = pupil.getBoundingClientRect();
        // Store center as fraction of char image size so it survives layout reflow
        eyeAnchors.push({
          cx: rect.left + rect.width / 2,
          cy: rect.top + rect.height / 2
        });
      });
    }

    // Initial computation after a short delay (after GSAP sets positions)
    setTimeout(computeEyeAnchors, 400);
    window.addEventListener("resize", () => {
      // Re-anchor after resize settles
      clearTimeout(window._eyeResizeTimer);
      window._eyeResizeTimer = setTimeout(computeEyeAnchors, 300);
    });

    window.addEventListener("mousemove", (e) => {
      if (isMobile()) return; // no tracking on touch devices
      if (eyeAnchors.length === 0) computeEyeAnchors();

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      pupils.forEach((pupil, idx) => {
        const anchor = eyeAnchors[idx];
        if (!anchor) return;

        const deltaX = mouseX - anchor.cx;
        const deltaY = mouseY - anchor.cy;
        const angle = Math.atan2(deltaY, deltaX);

        // Strict boundary: max 8px movement radius
        const distance = Math.min(Math.hypot(deltaX, deltaY) / 10, 8);

        const moveX = distance * Math.cos(angle);
        let moveY = distance * Math.sin(angle);

        // Prevent googly upward bulge
        if (moveY > 3) moveY = 3;

        gsap.to(pupil, {
          x: moveX,
          y: moveY,
          duration: 0.15,
          ease: "sine.out"
        });
      });
    });

    window.addEventListener("mouseleave", () => {
      pupils.forEach((pupil) => {
        gsap.to(pupil, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "power2.out"
        });
      });
    });
  }

  // ABOUT ME PARALLAX & SCROLL AGGREGATE
  // Parallax of floral.png correctly covering bounds
  gsap.fromTo(".floral-decor",
    { y: -100, opacity: 0 },
    {
      y: 100,
      opacity: 0.8,
      ease: "none",
      scrollTrigger: {
        trigger: ".about-section",
        start: "top bottom", // Animation begins explicitly when hero ends
        end: "bottom center",
        scrub: 2
      }
    }
  );

  // Fade pink overlay
  gsap.to(".pink-overlay", {
    opacity: 1,
    ease: "power1.out",
    duration: 1.5,
    scrollTrigger: {
      trigger: ".about-section",
      start: "top 70%"
    }
  });

  // Parallax the portrait image
  gsap.fromTo(".about-portrait",
    { y: 150, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      ease: "power1.out",
      scrollTrigger: {
        trigger: ".about-container",
        start: "top 85%",
        end: "center center",
        scrub: 1.5
      }
    }
  );

  // Cascade the text content — covers all new About Me classes
  const aboutTexts = gsap.utils.toArray([
    ".about-text-content h2",
    ".about-text",
    ".technologies-title",
    ".quote-block",
    ".about-text-bottom",
  ].join(", "));
  gsap.to(aboutTexts, {
    opacity: 1,
    x: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".about-container",
      start: "top 75%"
    }
  });

  // Soft pink bubbles stagger animation
  gsap.to(".skill-bubble", {
    opacity: 1,
    scale: 1,
    duration: 0.6,
    stagger: 0.1,
    ease: "back.out(2)",
    scrollTrigger: {
      trigger: ".skills-container",
      start: "top 85%"
    }
  });

  // --- EXPERIENCE SECTION ---
  // Background Parallax
  gsap.fromTo(".exp-section",
    { backgroundPosition: "50% 0%" },
    {
      backgroundPosition: "50% 100%",
      ease: "none",
      scrollTrigger: {
        trigger: ".exp-section",
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    }
  );

  // Tab switching logic
  const expTabs = document.querySelectorAll('.exp-tab');

  expTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Don't animate if already active
      if (tab.classList.contains('active')) return;

      const targetId = tab.getAttribute('data-target');
      const currentActiveTab = document.querySelector('.exp-tab.active');
      const currentActivePanel = document.querySelector('.exp-panel.active-panel');
      const newActivePanel = document.getElementById(targetId);

      // Tab UI Update
      currentActiveTab.classList.remove('active');
      tab.classList.add('active');

      // GSAP Timeline for smooth panel transition
      const tl = gsap.timeline();
      
      tl.to(currentActivePanel, {
        opacity: 0,
        x: -20,
        duration: 0.2,
        onComplete: () => {
          currentActivePanel.classList.remove('active-panel');
          newActivePanel.classList.add('active-panel');
          
          // Before animating in, set correct starting state
          gsap.set(newActivePanel, { opacity: 0, x: 20 });
          gsap.set(newActivePanel.querySelectorAll('.exp-bullets li'), { opacity: 0, x: 10 });
        }
      })
      .to(newActivePanel, { opacity: 1, x: 0, duration: 0.3 })
      .to(newActivePanel.querySelectorAll('.exp-bullets li'), { 
        opacity: 1, 
        x: 0, 
        duration: 0.3, 
        stagger: 0.1 
      }, "-=0.1");
    });
  });

  // --- PROJECTS SECTION ---
  // Autoplay all game carousel videos
  document.querySelectorAll('#carouselTrack video').forEach(v => {
    v.play().catch(() => {});
  });

  // Grid Alternating Entry Animation
  const tilesLeft = gsap.utils.toArray('.tile-left');
  tilesLeft.forEach(tile => {
    gsap.fromTo(tile, 
      { opacity: 0, x: -100 },
      {
        opacity: 1, x: 0, duration: 0.8, ease: "power2.out",
        scrollTrigger: {
          trigger: tile,
          start: "top 85%"
        }
      }
    );
  });

  const tilesRight = gsap.utils.toArray('.tile-right');
  tilesRight.forEach(tile => {
    gsap.fromTo(tile, 
      { opacity: 0, x: 100 },
      {
        opacity: 1, x: 0, duration: 0.8, ease: "power2.out",
        scrollTrigger: {
          trigger: tile,
          start: "top 85%"
        }
      }
    );
  });

  // Sparkle particle logic on tile hover
  const gridTiles = document.querySelectorAll('.project-tile');
  gridTiles.forEach(tile => {
    tile.addEventListener('mousemove', (e) => {
      // Throttle particle creation
      if (Math.random() > 0.1) return;
      
      const particle = document.createElement('div');
      particle.classList.add('sparkle-particle');
      
      // Calculate local mouse pos
      const rect = tile.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Randomize small sizes
      const size = Math.random() * 6 + 2;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      tile.appendChild(particle);
      
      // Float up and fade out
      gsap.to(particle, {
        y: -50,
        x: (Math.random() - 0.5) * 40,
        opacity: 0,
        duration: 1 + Math.random(),
        ease: "power1.out",
        onComplete: () => particle.remove()
      });
    });
  });

  // =============================================================
  // HAMBURGER / MOBILE SIDEBAR
  // =============================================================
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileSidebar = document.getElementById('mobileSidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const sidebarLinks = document.querySelectorAll('.sidebar-link');

  function openSidebar() {
    mobileSidebar.classList.add('open');
    sidebarBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden'; // prevent scroll behind sidebar
  }

  function closeSidebar() {
    mobileSidebar.classList.remove('open');
    sidebarBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburgerBtn.addEventListener('click', () => {
    if (mobileSidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  sidebarCloseBtn.addEventListener('click', closeSidebar);
  sidebarBackdrop.addEventListener('click', closeSidebar);

  // Close on nav link click (smooth scroll to section)
  sidebarLinks.forEach(link => {
    link.addEventListener('click', closeSidebar);
  });

});
