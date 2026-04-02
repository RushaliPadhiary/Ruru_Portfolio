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
      duration: 0.6, // Adjust speed of wave here
      repeat: -1,
      onRepeat: () => {
        isFrameOne = !isFrameOne;
        heroCharImg.src = isFrameOne ? "assets/images/blank_metwo.png" : "assets/images/blank_me.png";
      }
    });

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

});
