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
    let isFrameOne = true;

    // Preload the second frame to prevent flickering
    const secondFrame = new Image();
    secondFrame.src = "assets/images/blank_me.png";

    gsap.to({}, {
      duration: 0.3, // Adjust speed of wave here
      repeat: -1,
      onRepeat: () => {
        isFrameOne = !isFrameOne;
        heroCharImg.src = isFrameOne ? "assets/images/blank_metwo.png" : "assets/images/blank_me.png";
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
            const scale = 0.55 + pos.zDepth * 0.15; // Decreased size as requested
            
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

            // Cascade the subtext naturally
            gsap.to(".hero-placeholder-text", {
              opacity: 1,
              y: -10,
              duration: 1,
              ease: "power2.out"
            });
          }
        });
      }
    });

    // Eye Tracking Logic (Constrained securely within boundaries)
    const pupils = document.querySelectorAll(".hero-pupil");

    window.addEventListener("mousemove", (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      pupils.forEach((pupil) => {
        const rect = pupil.getBoundingClientRect();

        const pupilCenterX = rect.left + rect.width / 2;
        const pupilCenterY = rect.top + rect.height / 2;

        const deltaX = mouseX - pupilCenterX;
        const deltaY = mouseY - pupilCenterY;
        const angle = Math.atan2(deltaY, deltaX);

        // Strict boundary scaling so it does not bleed out of the eye socket
        const distance = Math.min(Math.hypot(deltaX, deltaY) / 10, 8);

        const moveX = distance * Math.cos(angle);
        let moveY = distance * Math.sin(angle);

        // Prevent googly bulging effect
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

  // Cascade the text content
  const aboutTexts = gsap.utils.toArray(".about-text-content h2, .about-placeholder, .technologies-title, .about-placeholder-bottom");
  gsap.to(aboutTexts, {
    opacity: 1,
    x: 0,
    duration: 0.8,
    stagger: 0.15,
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
  // Carousel Video Logic
  const videoCards = document.querySelectorAll('.video-card');
  videoCards.forEach(card => {
    const video = card.querySelector('video');
    card.addEventListener('mouseenter', () => video.play());
    card.addEventListener('mouseleave', () => video.pause());
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

});
