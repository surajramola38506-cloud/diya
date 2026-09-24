/* ==========================================================================
   ROYAL CINEMATIC BIRTHDAY EXPERIENCE - ULTRA-PREMIUM LOGIC & 3D ENGINE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Core State
  let isCandleExtinguished = false;
  let isListeningMic = false;
  let isMusicPlaying = false;
  let micAudioContext = null;

  // Initialize Audio & Unveil Intro
  const introOverlay = document.getElementById("introCurtain");
  const unveilBtn = document.getElementById("unveilBtn");
  const musicToggleBtn = document.getElementById("musicToggleBtn");
  const themeToggleBtn = document.getElementById("themeToggleBtn");

  unveilBtn.addEventListener("click", () => {
    introOverlay.classList.add("unveiled");
    if (window.royalAudio) {
      window.royalAudio.startMusic();
      isMusicPlaying = true;
      updateMusicIcon();
    }
    // Launch initial celebratory golden petals shower
    burstPetalsShower(30);
    // Haptic feedback
    triggerHaptic(100);
  });

  function updateMusicIcon() {
    if (musicToggleBtn) {
      musicToggleBtn.innerHTML = isMusicPlaying
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.27 3L3 4.27l9 9v.28c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-1.73l4.27 4.27c-.82.68-1.85 1.15-2.98 1.34v2.03c1.68-.23 3.19-.94 4.41-1.99l2.03 2.03L21 20.73 4.27 3zM14 7h4V3h-6v5.18l2 2V7z"/></svg>`;
    }
  }

  musicToggleBtn.addEventListener("click", () => {
    if (window.royalAudio) {
      isMusicPlaying = window.royalAudio.toggleMusic();
      updateMusicIcon();
      triggerHaptic(50);
    }
  });

  // Dark / Light Theme Toggle
  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", nextTheme);
    triggerHaptic(40);
  });

  function triggerHaptic(ms = 80) {
    if (window.AndroidBridge && window.AndroidBridge.vibrate) {
      window.AndroidBridge.vibrate(ms);
    } else if (navigator.vibrate) {
      navigator.vibrate(ms);
    }
  }

  // =========================================================================
  // 2. STARRY NIGHT & METEOR SKY (Canvas)
  // =========================================================================
  const starCanvas = document.getElementById("starCanvas");
  const starCtx = starCanvas.getContext("2d");
  let stars = [];
  let meteors = [];

  function resizeStarCanvas() {
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
    initStars();
  }

  function initStars() {
    stars = [];
    const count = Math.floor((starCanvas.width * starCanvas.height) / 3800);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        color: Math.random() > 0.3 ? "#fff8db" : "#ffb6c1",
      });
    }
  }

  function createMeteor() {
    if (Math.random() < 0.015 && meteors.length < 3) {
      meteors.push({
        x: Math.random() * starCanvas.width,
        y: Math.random() * (starCanvas.height * 0.4),
        length: Math.random() * 90 + 50,
        speed: Math.random() * 10 + 12,
        angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
        alpha: 1.0,
      });
    }
  }

  function drawStars() {
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);

    // Stars
    for (const s of stars) {
      s.alpha += s.twinkleSpeed;
      if (s.alpha > 1 || s.alpha < 0.15) s.twinkleSpeed = -s.twinkleSpeed;

      starCtx.beginPath();
      starCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      starCtx.fillStyle = s.color;
      starCtx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
      starCtx.fill();
    }

    // Meteors
    createMeteor();
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      const tailX = m.x - Math.cos(m.angle) * m.length;
      const tailY = m.y - Math.sin(m.angle) * m.length;

      const grad = starCtx.createLinearGradient(m.x, m.y, tailX, tailY);
      grad.addColorStop(0, "rgba(255, 245, 215, " + m.alpha + ")");
      grad.addColorStop(1, "rgba(255, 215, 0, 0)");

      starCtx.beginPath();
      starCtx.moveTo(m.x, m.y);
      starCtx.lineTo(tailX, tailY);
      starCtx.strokeStyle = grad;
      starCtx.lineWidth = 2;
      starCtx.stroke();

      m.x += Math.cos(m.angle) * m.speed;
      m.y += Math.sin(m.angle) * m.speed;
      m.alpha -= 0.02;

      if (m.alpha <= 0 || m.x > starCanvas.width || m.y > starCanvas.height) {
        meteors.splice(i, 1);
      }
    }

    starCtx.globalAlpha = 1.0;
    requestAnimationFrame(drawStars);
  }

  window.addEventListener("resize", resizeStarCanvas);
  resizeStarCanvas();
  drawStars();

  // =========================================================================
  // 3. FALLING ROSE PETALS SIMULATION (3D Sway & Wind)
  // =========================================================================
  const petalCanvas = document.getElementById("petalsCanvas");
  const petalCtx = petalCanvas.getContext("2d");
  let petals = [];

  function resizePetalCanvas() {
    petalCanvas.width = window.innerWidth;
    petalCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizePetalCanvas);
  resizePetalCanvas();

  class RosePetal {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * petalCanvas.width;
      this.y = initial ? Math.random() * petalCanvas.height : -30;
      this.size = Math.random() * 14 + 10;
      this.speedY = Math.random() * 1.5 + 1.2;
      this.speedX = Math.random() * 1.2 - 0.6;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.04;
      this.sway = Math.random() * Math.PI * 2;
      this.swaySpeed = Math.random() * 0.03 + 0.01;
      this.flip = Math.random() * Math.PI;
      this.flipSpeed = Math.random() * 0.04 + 0.02;
      // Velvet Crimson, Rose Gold, or Soft Pink
      const colors = ["#b71c1c", "#c2185b", "#d81b60", "#e91e63", "#f48fb1", "#d4af37"];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.y += this.speedY;
      this.sway += this.swaySpeed;
      this.x += Math.sin(this.sway) * 1.8 + this.speedX;
      this.rotation += this.rotSpeed;
      this.flip += this.flipSpeed;

      if (this.y > petalCanvas.height + 40 || this.x < -40 || this.x > petalCanvas.width + 40) {
        this.reset();
      }
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(Math.cos(this.flip), 1);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size / 2, this.size / 2, 0, this.size);
      ctx.bezierCurveTo(this.size / 2, this.size / 2, this.size / 2, -this.size / 2, 0, 0);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.85;
      ctx.fill();

      // Delicate petal highlight
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    }
  }

  // Create ambient petals
  for (let i = 0; i < 35; i++) {
    petals.push(new RosePetal());
  }

  function burstPetalsShower(count = 35) {
    for (let i = 0; i < count; i++) {
      const p = new RosePetal();
      p.y = -20;
      p.speedY = Math.random() * 3.5 + 2.5;
      petals.push(p);
    }
  }

  function loopPetals() {
    petalCtx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);
    for (const p of petals) {
      p.update();
      p.draw(petalCtx);
    }
    if (petals.length > 55) {
      petals.splice(0, 1);
    }
    requestAnimationFrame(loopPetals);
  }
  loopPetals();

  // "Shower of Petals" button trigger
  const petalShowerBtn = document.getElementById("showerPetalsBtn");
  if (petalShowerBtn) {
    petalShowerBtn.addEventListener("click", () => {
      burstPetalsShower(45);
      triggerHaptic(60);
      if (window.royalAudio) window.royalAudio.playSparkle();
    });
  }

  // =========================================================================
  // 4. THREE.JS 3D LUXURY BIRTHDAY CAKE & FLICKERING CANDLES
  // =========================================================================
  const cakeContainer = document.getElementById("cakeViewport");
  let scene, camera, renderer, cakeGroup, candleFlames = [];

  function initThreeCake() {
    if (!window.THREE || !cakeContainer) return;

    scene = new THREE.Scene();
    const width = cakeContainer.clientWidth || 360;
    const height = cakeContainer.clientHeight || 340;

    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 4.5, 9);
    camera.lookAt(0, 1.2, 0);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    cakeContainer.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffdfba, 1.4);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const goldPoint = new THREE.PointLight(0xffd700, 1.8, 15);
    goldPoint.position.set(0, 5, 0);
    scene.add(goldPoint);

    cakeGroup = new THREE.Group();
    scene.add(cakeGroup);

    // 1. Golden Pedestal / Cake Stand
    const standMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25,
    });
    const standPlate = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.8, 0.25, 48), standMat);
    standPlate.position.y = -0.12;
    cakeGroup.add(standPlate);

    const standBase = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.4, 0.6, 48), standMat);
    standBase.position.y = -0.55;
    cakeGroup.add(standBase);

    // 2. Base Tier (Velvet Burgundy Cream)
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x5a1128,
      metalness: 0.15,
      roughness: 0.45,
    });
    const baseTier = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 1.5, 48), baseMat);
    baseTier.position.y = 0.75;
    cakeGroup.add(baseTier);

    // Gold Trim Ring
    const goldRingMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.2,
    });
    const baseTrim = new THREE.Mesh(new THREE.TorusGeometry(3.02, 0.07, 16, 48), goldRingMat);
    baseTrim.rotation.x = Math.PI / 2;
    baseTrim.position.y = 0.05;
    cakeGroup.add(baseTrim);

    // 3. Top Tier (Champagne Cream)
    const topMat = new THREE.MeshStandardMaterial({
      color: 0xfff0f5,
      metalness: 0.1,
      roughness: 0.6,
    });
    const topTier = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 1.3, 48), topMat);
    topTier.position.y = 2.15;
    cakeGroup.add(topTier);

    const topTrim = new THREE.Mesh(new THREE.TorusGeometry(2.02, 0.07, 16, 48), goldRingMat);
    topTrim.rotation.x = Math.PI / 2;
    topTrim.position.y = 1.5;
    cakeGroup.add(topTrim);

    // 4. Frosting Swirls & Strawberries on Top
    const berryMat = new THREE.MeshStandardMaterial({ color: 0xc4143a, roughness: 0.3 });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * 1.5;
      const z = Math.sin(angle) * 1.5;
      const berry = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), berryMat);
      berry.position.set(x, 2.85, z);
      cakeGroup.add(berry);
    }

    // 5. Three Golden Birthday Candles
    const candlePositions = [
      { x: 0, z: 0 },
      { x: -0.8, z: 0.3 },
      { x: 0.8, z: 0.3 },
    ];

    candlePositions.forEach((pos, idx) => {
      // Wax body
      const candleMat = new THREE.MeshStandardMaterial({
        color: 0xffe082,
        metalness: 0.4,
        roughness: 0.3,
      });
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 16), candleMat);
      candle.position.set(pos.x, 3.2, pos.z);
      cakeGroup.add(candle);

      // Wick
      const wickMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
      const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8), wickMat);
      wick.position.set(pos.x, 3.65, pos.z);
      cakeGroup.add(wick);

      // Flame (Outer glow + Inner core)
      const flameGroup = new THREE.Group();
      flameGroup.position.set(pos.x, 3.82, pos.z);

      const flameGeo = new THREE.ConeGeometry(0.12, 0.32, 16);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xffa000, transparent: true, opacity: 0.95 });
      const flameMesh = new THREE.Mesh(flameGeo, flameMat);
      flameGroup.add(flameMesh);

      const innerFlameGeo = new THREE.ConeGeometry(0.06, 0.2, 16);
      const innerFlameMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const innerFlame = new THREE.Mesh(innerFlameGeo, innerFlameMat);
      innerFlame.position.y = -0.04;
      flameGroup.add(innerFlame);

      // Point Light from Flame
      const flameLight = new THREE.PointLight(0xffa500, 1.2, 3);
      flameLight.position.set(0, 0, 0);
      flameGroup.add(flameLight);

      cakeGroup.add(flameGroup);
      candleFlames.push({ group: flameGroup, light: flameLight, originalY: 3.82 });
    });

    // Orbit Drag Interaction
    let isDragging = false;
    let prevMouseX = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const deltaX = clientX - prevMouseX;
      cakeGroup.rotation.y += deltaX * 0.012;
      prevMouseX = clientX;
    };

    const onPointerUp = () => { isDragging = false; };

    cakeContainer.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    cakeContainer.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    // Render loop
    let clock = new THREE.Clock();
    function animateCake() {
      requestAnimationFrame(animateCake);
      const elapsed = clock.getElapsedTime();

      // Gentle auto-rotation
      if (!isDragging) {
        cakeGroup.rotation.y += 0.005;
      }

      // Candle flame flickering physics
      if (!isCandleExtinguished) {
        candleFlames.forEach((cf, i) => {
          const flicker = Math.sin(elapsed * 18 + i * 2) * 0.08 + Math.cos(elapsed * 25) * 0.04;
          cf.group.scale.set(1 + flicker, 1 + flicker * 1.5, 1 + flicker);
          cf.light.intensity = 1.2 + flicker * 0.8;
          cf.group.position.y = cf.originalY + flicker * 0.03;
        });
      }

      renderer.render(scene, camera);
    }
    animateCake();

    window.addEventListener("resize", () => {
      if (!cakeContainer) return;
      const w = cakeContainer.clientWidth;
      const h = cakeContainer.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  initThreeCake();

  // =========================================================================
  // 5. BLOW CANDLE INTERACTION & FIREWORKS / CELEBRATION
  // =========================================================================
  const blowCandleBtn = document.getElementById("blowCandleBtn");
  const wishUnlockedBanner = document.getElementById("wishUnlockedBanner");
  const micStatusText = document.getElementById("micStatusText");

  function extinguishCandleAndCelebrate() {
    if (isCandleExtinguished) return;
    isCandleExtinguished = true;

    // Extinguish 3D flames
    candleFlames.forEach((cf) => {
      cf.group.visible = false;
      cf.light.intensity = 0;
    });

    // Audio SFX: Candle blow + Celebration fanfare
    if (window.royalAudio) {
      window.royalAudio.playCandleBlow();
      setTimeout(() => {
        window.royalAudio.playCelebrationCheer();
      }, 350);
    }

    // Android Haptics
    triggerHaptic(250);

    // Confetti Explosion
    triggerMassiveCelebrationConfetti();

    // Spawn Floating Balloons
    spawnFestiveBalloons(15);

    // Update Button & Banner
    if (blowCandleBtn) {
      blowCandleBtn.classList.add("extinguished");
      blowCandleBtn.innerHTML = `<span>✨ Relight Candles</span>`;
    }
    if (wishUnlockedBanner) {
      wishUnlockedBanner.style.display = "block";
    }

    // Announce via Toast if on Android
    if (window.AndroidBridge && window.AndroidBridge.showToast) {
      window.AndroidBridge.showToast("Happy Birthday Diya! May all your dreams come true! 🎂✨");
    }
  }

  function relightCandles() {
    isCandleExtinguished = false;
    candleFlames.forEach((cf) => {
      cf.group.visible = true;
      cf.light.intensity = 1.2;
    });
    if (blowCandleBtn) {
      blowCandleBtn.classList.remove("extinguished");
      blowCandleBtn.innerHTML = `<span>💨 Blow the Candles</span>`;
    }
    if (wishUnlockedBanner) {
      wishUnlockedBanner.style.display = "none";
    }
    triggerHaptic(60);
  }

  if (blowCandleBtn) {
    blowCandleBtn.addEventListener("click", () => {
      if (isCandleExtinguished) {
        relightCandles();
      } else {
        extinguishCandleAndCelebrate();
      }
    });
  }

  // Optional: Microphone Blow Detection
  const micBlowBtn = document.getElementById("micBlowToggle");
  if (micBlowBtn) {
    micBlowBtn.addEventListener("click", async () => {
      if (isListeningMic) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        isListeningMic = true;
        micStatusText.innerText = "🎤 Listening... Blow gently onto your phone's microphone!";
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        micAudioContext = new AudioCtx();
        const source = micAudioContext.createMediaStreamSource(stream);
        const analyser = micAudioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkVolume = () => {
          if (!isListeningMic || isCandleExtinguished) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;

          // If puff/blow detected
          if (avg > 55) {
            extinguishCandleAndCelebrate();
            isListeningMic = false;
            micStatusText.innerText = "✨ Blown with love!";
            stream.getTracks().forEach((track) => track.stop());
            return;
          }
          requestAnimationFrame(checkVolume);
        };
        checkVolume();
      } catch (err) {
        micStatusText.innerText = "Tap the 'Blow the Candles' button above!";
      }
    });
  }

  // =========================================================================
  // 6. CONFETTI & BALLOONS
  // =========================================================================
  function triggerMassiveCelebrationConfetti() {
    if (window.confetti) {
      const colors = ["#ffd700", "#ff758c", "#ff5e62", "#ffffff", "#d4af37"];
      // Center burst
      window.confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors,
      });

      // Left and Right Cannons
      setTimeout(() => {
        window.confetti({
          particleCount: 50,
          angle: 60,
          spread: 65,
          origin: { x: 0, y: 0.7 },
          colors: colors,
        });
        window.confetti({
          particleCount: 50,
          angle: 120,
          spread: 65,
          origin: { x: 1, y: 0.7 },
          colors: colors,
        });
      }, 250);
    }
  }

  function spawnFestiveBalloons(count = 12) {
    const balloonColors = [
      "radial-gradient(circle at 30% 30%, #ffd700, #b8860b)",
      "radial-gradient(circle at 30% 30%, #ff8da1, #c2185b)",
      "radial-gradient(circle at 30% 30%, #ffffff, #dcdcdc)",
      "radial-gradient(circle at 30% 30%, #ff6b81, #ee5253)",
      "radial-gradient(circle at 30% 30%, #e056fd, #be2edd)",
    ];

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const b = document.createElement("div");
        b.className = "balloon-element";
        b.style.left = `${Math.random() * 85 + 5}vw`;
        b.style.background = balloonColors[Math.floor(Math.random() * balloonColors.length)];
        b.style.animationDuration = `${Math.random() * 6 + 10}s`;

        b.addEventListener("click", () => {
          if (window.royalAudio) window.royalAudio.playBalloonPop();
          triggerHaptic(60);
          b.remove();
          if (window.confetti) {
            window.confetti({
              particleCount: 15,
              spread: 40,
              origin: { x: parseFloat(b.style.left) / 100, y: 0.5 },
            });
          }
        });

        document.body.appendChild(b);
        setTimeout(() => b.remove(), 16000);
      }, i * 350);
    }
  }

  // =========================================================================
  // 7. TOUCH / SPARKLE, CANVAS HEARTS & TIMELINE CARD HEART BURST
  // =========================================================================
  const sparkleCanvas = document.getElementById("sparkleCanvas");
  const sparkleCtx = sparkleCanvas.getContext("2d");
  let sparkles = [];
  let canvasHearts = [];

  function resizeSparkleCanvas() {
    sparkleCanvas.width = window.innerWidth;
    sparkleCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeSparkleCanvas);
  resizeSparkleCanvas();

  function addSparkle(x, y) {
    for (let i = 0; i < 3; i++) {
      sparkles.push({
        x: x + (Math.random() * 20 - 10),
        y: y + (Math.random() * 20 - 10),
        size: Math.random() * 3 + 1.5,
        alpha: 1.0,
        decay: Math.random() * 0.03 + 0.02,
        color: Math.random() > 0.4 ? "#ffd700" : "#ff8da1",
      });
    }
  }

  // High-performance Canvas Heart Particle with upward buoyancy and sway
  class CanvasHeartParticle {
    constructor(originX, originY) {
      this.x = originX;
      this.y = originY;
      // Spread outwards and float predominantly upwards
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      const speed = Math.random() * 4.5 + 2.5;
      this.vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 2;
      this.vy = Math.sin(angle) * speed - (Math.random() * 2.5 + 1.5);
      this.gravity = -0.055; // upward buoyancy
      this.size = Math.random() * 12 + 10;
      this.rotation = (Math.random() - 0.5) * 0.8;
      this.rotSpeed = (Math.random() - 0.5) * 0.05;
      this.sway = Math.random() * Math.PI * 2;
      this.swaySpeed = Math.random() * 0.07 + 0.03;
      this.swayAmp = Math.random() * 1.5 + 0.8;
      this.alpha = 1.0;
      this.decay = Math.random() * 0.012 + 0.009;

      const colors = [
        "#ffd700", // Royal Gold
        "#ff2a6d", // Vivid Crimson Rose
        "#ff758c", // Rose Gold
        "#ff5e62", // Coral Gold
        "#fff5d7", // Champagne
        "#f43f5e", // Ruby
        "#ff8da1"  // Soft Blush
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.vx *= 0.985;
      this.sway += this.swaySpeed;
      this.x += Math.sin(this.sway) * this.swayAmp;
      this.rotation += this.rotSpeed;
      this.alpha -= this.decay;
    }

    draw(ctx) {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      const scale = (this.size / 24) * Math.max(0, this.alpha);
      ctx.scale(scale, scale);

      ctx.beginPath();
      // Smooth vector heart path
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-12, -14, -24, -2, -24, 10);
      ctx.bezierCurveTo(-24, 22, -12, 30, 0, 42);
      ctx.bezierCurveTo(12, 30, 24, 22, 24, 10);
      ctx.bezierCurveTo(24, -2, 12, -14, 0, 0);
      ctx.closePath();

      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.fill();

      // Delicate golden highlight
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.restore();
    }
  }

  function loopSparkles() {
    sparkleCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);

    // Sparkle trail
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      sparkleCtx.beginPath();
      sparkleCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      sparkleCtx.fillStyle = s.color;
      sparkleCtx.globalAlpha = s.alpha;
      sparkleCtx.fill();

      s.alpha -= s.decay;
      s.y -= 0.6;
      if (s.alpha <= 0) sparkles.splice(i, 1);
    }

    // High-performance Canvas Heart Particles
    for (let i = canvasHearts.length - 1; i >= 0; i--) {
      const h = canvasHearts[i];
      h.update();
      h.draw(sparkleCtx);
      if (h.alpha <= 0 || h.y < -60) {
        canvasHearts.splice(i, 1);
      }
    }

    requestAnimationFrame(loopSparkles);
  }
  loopSparkles();

  const handlePointerSparkle = (e) => {
    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    addSparkle(x, y);
  };
  window.addEventListener("mousemove", handlePointerSparkle);
  window.addEventListener("touchmove", handlePointerSparkle, { passive: true });

  // Trigger high-performance dual Canvas API & CSS Animation burst of 20 heart particles
  function triggerTimelineHeartBurst(centerX, centerY) {
    const TOTAL_HEARTS = 20;

    // 1. Canvas API: Spawn 20 CanvasHeartParticles from element's center floating upwards
    for (let i = 0; i < TOTAL_HEARTS; i++) {
      canvasHearts.push(new CanvasHeartParticle(centerX, centerY));
    }

    // 2. CSS Animations: Spawn 20 hardware-accelerated floating heart particles with random offsets
    const heartIcons = ["💖", "❤️", "💕", "✨", "🌸", "👑", "💗", "🌹"];
    const glowColors = [
      "rgba(255, 215, 0, 0.9)",
      "rgba(255, 42, 109, 0.9)",
      "rgba(255, 117, 140, 0.9)",
      "rgba(244, 63, 94, 0.9)",
      "rgba(255, 182, 193, 0.9)"
    ];

    for (let i = 0; i < TOTAL_HEARTS; i++) {
      const el = document.createElement("div");
      el.className = "timeline-burst-heart";
      el.innerText = heartIcons[i % heartIcons.length];

      // Random horizontal spread and upward burst offsets
      const spreadAngle = (Math.PI / TOTAL_HEARTS) * i - Math.PI;
      const burstDist = Math.random() * 70 + 25;
      const offsetXMid = Math.cos(spreadAngle) * burstDist + (Math.random() - 0.5) * 50;
      const offsetYMid = -Math.abs(Math.sin(spreadAngle) * (burstDist * 0.65)) - (Math.random() * 30 + 10);

      // Float upwards with random horizontal drift
      const offsetXEnd = offsetXMid + (Math.random() - 0.5) * 160;
      const offsetYDist = Math.random() * 160 + 220; // 220px to 380px upwards

      const rotMid = (Math.random() - 0.5) * 35;
      const rotEnd = (Math.random() - 0.5) * 90;
      const duration = (Math.random() * 0.7 + 1.8).toFixed(2);
      const size = (Math.random() * 0.5 + 1.25).toFixed(2);
      const scale = (Math.random() * 0.35 + 1.1).toFixed(2);
      const glow = glowColors[i % glowColors.length];

      el.style.setProperty("--origin-x", `${centerX}px`);
      el.style.setProperty("--origin-y", `${centerY}px`);
      el.style.setProperty("--offset-x-mid", `${offsetXMid}px`);
      el.style.setProperty("--offset-y-mid", `${offsetYMid}px`);
      el.style.setProperty("--offset-x-end", `${offsetXEnd}px`);
      el.style.setProperty("--offset-y-dist", `${offsetYDist}px`);
      el.style.setProperty("--burst-rot-mid", `${rotMid}deg`);
      el.style.setProperty("--burst-rot-end", `${rotEnd}deg`);
      el.style.setProperty("--burst-duration", `${duration}s`);
      el.style.setProperty("--burst-size", `${size}rem`);
      el.style.setProperty("--burst-scale", scale);
      el.style.setProperty("--burst-glow", glow);

      document.body.appendChild(el);

      el.addEventListener("animationend", () => {
        el.remove();
      }, { once: true });
    }

    // Audio sparkle & haptic feedback
    if (window.royalAudio) {
      window.royalAudio.playSparkle();
    }
    triggerHaptic(50);
  }

  // Attach click listener to all .timeline-card elements
  const timelineCards = document.querySelectorAll(".timeline-card");
  timelineCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // Calculate clicked element's center coordinates
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Trigger high-performance burst of 20 hearts
      triggerTimelineHeartBurst(centerX, centerY);

      // Micro-bounce visual feedback
      card.classList.add("timeline-card-clicked");
      setTimeout(() => {
        card.classList.remove("timeline-card-clicked");
      }, 400);
    });
  });

  // Screen Tap Floating Heart Spawner (for ambient background taps)
  document.addEventListener("click", (e) => {
    // Avoid spawning on buttons, links, dock items, or timeline cards (which have dedicated burst)
    if (e.target.closest("button") || e.target.closest("a") || e.target.closest(".dock-item") || e.target.closest(".timeline-card")) return;
    const heart = document.createElement("div");
    heart.className = "floating-heart-particle";
    const heartIcons = ["💖", "🌸", "✨", "💕", "👑"];
    heart.innerText = heartIcons[Math.floor(Math.random() * heartIcons.length)];
    heart.style.left = `${e.clientX - 12}px`;
    heart.style.top = `${e.clientY - 12}px`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 3400);
  });

  // =========================================================================
  // 8. 3D WAX SEAL ENVELOPE & SURPRISE LETTER
  // =========================================================================
  const envelope = document.getElementById("waxEnvelope");
  const parchmentModal = document.getElementById("parchmentModal");
  const closeLetterBtn = document.getElementById("closeLetterBtn");

  if (envelope) {
    envelope.addEventListener("click", () => {
      envelope.classList.add("opened");
      if (window.royalAudio) window.royalAudio.playWaxSeal();
      triggerHaptic(120);

      setTimeout(() => {
        if (parchmentModal) {
          parchmentModal.classList.add("active");
        }
      }, 700);
    });
  }

  if (closeLetterBtn && parchmentModal) {
    closeLetterBtn.addEventListener("click", () => {
      parchmentModal.classList.remove("active");
      triggerHaptic(50);
    });
  }

  // =========================================================================
  // 9. VOICE MESSAGE PLAYER
  // =========================================================================
  const playVoiceBtn = document.getElementById("playVoiceBtn");
  const voiceCanvas = document.getElementById("voiceWaveCanvas");
  let isVoicePlaying = false;
  let voiceAnimId = null;

  if (playVoiceBtn && voiceCanvas) {
    const vCtx = voiceCanvas.getContext("2d");
    voiceCanvas.width = 300;
    voiceCanvas.height = 40;

    function drawWaveform(progress = 0) {
      vCtx.clearRect(0, 0, voiceCanvas.width, voiceCanvas.height);
      const bars = 36;
      const barWidth = 4;
      const gap = 4;

      for (let i = 0; i < bars; i++) {
        const x = i * (barWidth + gap) + 10;
        let height = Math.sin(i * 0.4 + Date.now() * 0.008) * 12 + 16;
        if (!isVoicePlaying) height = Math.sin(i * 0.3) * 6 + 10;

        vCtx.fillStyle = (i / bars) < progress ? "#ffd700" : "rgba(255, 255, 255, 0.3)";
        vCtx.beginPath();
        vCtx.roundRect(x, (voiceCanvas.height - height) / 2, barWidth, height, 2);
        vCtx.fill();
      }
    }
    drawWaveform();

    playVoiceBtn.addEventListener("click", () => {
      isVoicePlaying = !isVoicePlaying;
      triggerHaptic(50);
      playVoiceBtn.innerHTML = isVoicePlaying
        ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
        : `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;

      if (isVoicePlaying) {
        // Play melodic piano accompaniment while speaking
        if (window.royalAudio) {
          window.royalAudio.playPianoNote(523.25, 3.5, 0.4);
          setTimeout(() => window.royalAudio.playPianoNote(659.25, 3.5, 0.4), 1200);
          setTimeout(() => window.royalAudio.playPianoNote(783.99, 4.0, 0.4), 2400);
        }

        let start = Date.now();
        const duration = 12000; // 12 seconds simulated voice note
        function updateVoiceWave() {
          if (!isVoicePlaying) return;
          const elapsed = Date.now() - start;
          const prog = Math.min(elapsed / duration, 1);
          drawWaveform(prog);

          if (prog >= 1) {
            isVoicePlaying = false;
            playVoiceBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
            drawWaveform(0);
          } else {
            voiceAnimId = requestAnimationFrame(updateVoiceWave);
          }
        }
        updateVoiceWave();
      } else {
        cancelAnimationFrame(voiceAnimId);
        drawWaveform(0);
      }
    });
  }

  // =========================================================================
  // 10. AI BIRTHDAY WISH ASSISTANT / POET
  // =========================================================================
  const aiToneChips = document.querySelectorAll(".ai-tone-chip");
  const aiResultText = document.getElementById("aiResultText");
  const generateAiWishBtn = document.getElementById("generateAiWishBtn");
  const copyWishBtn = document.getElementById("copyWishBtn");
  const pinAiWishBtn = document.getElementById("pinAiWishBtn");

  let currentTone = "romantic";

  const aiWishBank = {
    romantic: [
      "To the girl who carries sunshine in her smile and poetry in her eyes: May your birthday be as timeless, radiant, and enchanting as you are to my heart. ✨❤️",
      "In a world full of ordinary moments, having you in my life makes every day feel like a royal fairytale. Happy Birthday, my favorite person! 🌹",
      "May every wish whispered to the stars find its way to you today. You deserve the entire universe wrapped in love and joy. 💖",
    ],
    emotional: [
      "Diya, some souls leave footprints on your heart that never fade. Thank you for your kindness, your unfiltered laughter, and just for being you. Happy Birthday! 🌸",
      "Watching you grow, achieve, and laugh with that same innocent warmth is my favorite thing. May this new year of life bring you boundless peace and success. ✨",
      "Through all the talks, late-night chats, and silly fights, you will always be irreplaceable. Blessed to celebrate another year of your light. 💫",
    ],
    playful: [
      "Happy Birthday to the girl whose favorite hobby is: 'Milna hai mujhe tere se' and then taking a whole 3-hour interview when we meet! 😂 Stay fabulous!",
      "Happy Birthday! Don't worry, you are not getting older... you're just leveling up in drama and cuteness! 👑🕶️",
      "Sending you 365 days of good vibes, zero annoying questions, and all your favorite food! Cheers to the coolest queen! 🥳",
    ],
    shayari: [
      "चमकती रहे तेरी हंसी तारों की तरह,\nमहकती रहे ज़िंदगी बहारों की तरह,\nदुआ है रब से ये खास दिन लाए खुशियां हज़ार,\nमुबारक हो जन्मदिन तुझे सबसे खास यार! ✨🌸",
      "तेरी मुस्कुराहट से रोशन है जहां हमारा,\nतू रहे सलामत, बस यही ख़्वाब हमारा,\nजन्मदिन की ढेरों शुभकामनाएं! 💖👑",
      "खुदा करे ये दिन बार-बार आए,\nहर लम्हा तेरे लिए ढेर सारी खुशियां लाए! 🌹✨",
    ],
  };

  aiToneChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      aiToneChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      currentTone = chip.getAttribute("data-tone");
      triggerHaptic(40);
    });
  });

  if (generateAiWishBtn) {
    generateAiWishBtn.addEventListener("click", () => {
      triggerHaptic(60);
      const bank = aiWishBank[currentTone] || aiWishBank.romantic;
      const pick = bank[Math.floor(Math.random() * bank.length)];

      aiResultText.innerText = "";
      let charIdx = 0;
      const interval = setInterval(() => {
        if (charIdx < pick.length) {
          aiResultText.innerText += pick[charIdx];
          charIdx++;
        } else {
          clearInterval(interval);
          if (window.royalAudio) window.royalAudio.playSparkle();
        }
      }, 16);
    });
  }

  if (copyWishBtn) {
    copyWishBtn.addEventListener("click", () => {
      const text = aiResultText.innerText;
      if (text) {
        navigator.clipboard.writeText(text);
        triggerHaptic(80);
        copyWishBtn.innerText = "✓ Copied!";
        setTimeout(() => (copyWishBtn.innerText = "📋 Copy Wish"), 2000);
      }
    });
  }

  // =========================================================================
  // 11. GUEST WISHES WALL
  // =========================================================================
  const wishesGrid = document.getElementById("wishesGrid");
  const addWishForm = document.getElementById("addWishForm");
  const guestAuthorInput = document.getElementById("guestAuthor");
  const guestTextInput = document.getElementById("guestText");
  const guestTagSelect = document.getElementById("guestTag");

  if (pinAiWishBtn) {
    pinAiWishBtn.addEventListener("click", () => {
      const wishText = aiResultText.innerText;
      if (!wishText) return;
      addNewWishToWall("AI Wish Muse ✨", wishText, "🌸 Queen");
      triggerHaptic(70);
      pinAiWishBtn.innerText = "✓ Pinned to Wall!";
      setTimeout(() => (pinAiWishBtn.innerText = "📌 Pin to Wishes Wall"), 2000);
    });
  }

  function addNewWishToWall(author, text, tag = "💖 Love") {
    if (!wishesGrid) return;
    const card = document.createElement("div");
    card.className = "wish-card";
    card.innerHTML = `
      <div class="wish-card-header">
        <span class="wish-author">${author}</span>
        <span class="wish-tag-badge">${tag}</span>
      </div>
      <p class="wish-card-text">${text}</p>
      <div class="wish-card-footer">
        <button class="btn-like-wish" onclick="this.classList.toggle('liked'); window.royalAudio?.playSparkle();">
          <span>❤️</span> <span class="like-count">1</span>
        </button>
        <span style="font-size: 0.72rem; color: var(--text-muted);">Just now</span>
      </div>
    `;
    wishesGrid.prepend(card);
    if (window.royalAudio) window.royalAudio.playSparkle();
  }

  if (addWishForm) {
    addWishForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const author = guestAuthorInput.value.trim() || "A Well-Wisher";
      const text = guestTextInput.value.trim();
      const tag = guestTagSelect.value || "✨ Magic";

      if (text) {
        addNewWishToWall(author, text, tag);
        guestTextInput.value = "";
        triggerHaptic(80);
      }
    });
  }

  // =========================================================================
  // 12. PHOTO GALLERY UPLOAD & LIGHTBOX
  // =========================================================================
  const customPhotoInput = document.getElementById("customPhotoInput");
  const uploadPhotoSlot = document.getElementById("uploadPhotoSlot");

  if (uploadPhotoSlot && customPhotoInput) {
    uploadPhotoSlot.addEventListener("click", () => {
      customPhotoInput.click();
    });

    customPhotoInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const gallery = document.getElementById("galleryGrid");
          const newCard = document.createElement("div");
          newCard.className = "gallery-card";
          newCard.innerHTML = `
            <img src="${event.target.result}" alt="Cherished Moment" class="gallery-card-img" />
            <div class="gallery-overlay">
              <h4 class="gallery-caption-title">New Precious Memory</h4>
              <p class="gallery-caption-sub">Captured with love ❤️</p>
            </div>
          `;
          gallery.insertBefore(newCard, uploadPhotoSlot);
          triggerHaptic(100);
          burstPetalsShower(25);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // =========================================================================
  // 13. SHARE BIRTHDAY EXPERIENCE
  // =========================================================================
  const shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", () => {
      const shareText = "👑 Step into Diya's Ultra-Premium Birthday Experience! 3D Cake, Music & Love ✨";
      if (window.AndroidBridge && window.AndroidBridge.shareBirthdayCard) {
        window.AndroidBridge.shareBirthdayCard(shareText);
      } else if (navigator.share) {
        navigator.share({
          title: "Happy Birthday Diya ✨",
          text: shareText,
          url: window.location.href,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Celebration link copied to clipboard!");
      }
      triggerHaptic(60);
    });
  }
});
