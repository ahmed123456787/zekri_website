/* ═══════════════════════════════════════════════
   HERO — interactive 3D gold medallion (Three.js r128)
   The Zekri logo embossed on a spinning gold coin.
   Drag to spin (momentum) · tap to flip · gyro tilt on mobile
═══════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('tooth3d');
  if (!canvas || typeof THREE === 'undefined') return;
  const wrap = canvas.parentElement;
  let W = wrap.clientWidth || 400, H = wrap.clientHeight || 400;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W, H, false);
  if ('outputEncoding' in renderer) renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
  camera.position.set(0, 0, 5);

  // ── Lighting (gives the gold its moving shine) ──
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.95); key.position.set(2, 3, 4); scene.add(key);
  const fill = new THREE.DirectionalLight(0xC9A84C, 0.45); fill.position.set(-3, -1, 2); scene.add(fill);
  const glint = new THREE.PointLight(0xFFE8B0, 0.7, 20); glint.position.set(0, 0.5, 4); scene.add(glint);

  // ── The coin ──
  const R = 1.6, THICK = 0.32, EPS = 0.02;
  const coin = new THREE.Group();
  scene.add(coin);

  const rimMat = new THREE.MeshPhongMaterial({ color: 0xC9A84C, specular: 0xFFF0C0, shininess: 80, emissive: 0x1a1400 });
  const faceMat = new THREE.MeshPhongMaterial({ color: 0x12110A, specular: 0x4A4636, shininess: 40, emissive: 0x0a0900 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, THICK, 96), [rimMat, faceMat, faceMat]);
  body.rotation.x = Math.PI / 2; // circular faces point toward the camera (±Z)
  coin.add(body);

  // ── Logo raised as true 3D relief on both faces (minted-coin emboss) ──
  const AR = 198 / 233;                 // logo aspect (height / width) — keep proportions
  const S = 2 * R * 0.82;               // logo width
  const SH = S * AR;                    // logo height
  const SEG_W = 240;                    // tessellation so displacement reads as real depth
  const SEG_H = Math.round(SEG_W * AR);

  const loader = new THREE.TextureLoader();
  const setup = function (t) {
    if ('encoding' in t) t.encoding = THREE.sRGBEncoding;
    try { t.anisotropy = renderer.capabilities.getMaxAnisotropy(); } catch (e) {}
  };
  const colorTex = loader.load('logo-mark.png?v=29', setup);        // gold color of the mark
  const heightTex = loader.load('logo-height.png?v=29', function (t) {
    try { t.anisotropy = renderer.capabilities.getMaxAnisotropy(); } catch (e) {}
  });

  // Lit gold so the relief catches the moving lights; displacement gives real depth,
  // bump sharpens the emboss at full texture resolution; alphaTest cuts the mark out
  // cleanly so the coin's gold shows around it.
  const logoMat = new THREE.MeshPhongMaterial({
    color: 0xD8B65A, emissive: 0x3A2C0A, specular: 0xFFEFC2, shininess: 110,
    map: colorTex, alphaTest: 0.3,
    bumpMap: heightTex, bumpScale: 0.05,
    displacementMap: heightTex, displacementScale: 0.09
  });

  function addLogoFace(zSign) {
    const geo = new THREE.PlaneGeometry(S, SH, SEG_W, SEG_H);
    const mesh = new THREE.Mesh(geo, logoMat);
    mesh.position.z = zSign * (THICK / 2 + EPS);
    if (zSign < 0) mesh.rotation.y = Math.PI;   // relief raises outward on the back too
    coin.add(mesh);
  }
  addLogoFace(1);
  addLogoFace(-1);

  // ── Interaction state ──
  let dragging = false;
  let rotY = -0.2, rotX = -0.1, velY = 0.006, velX = 0;
  let lastX = 0, lastY = 0, downX = 0, downY = 0, downT = 0;
  let gx = 0, gy = 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function inside(cx, cy) {
    const r = canvas.getBoundingClientRect();
    return cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
  }
  canvas.addEventListener('pointerdown', function (e) {
    dragging = true;
    lastX = downX = e.clientX; lastY = downY = e.clientY; downT = performance.now();
    velY = 0; velX = 0;
    if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (x) {} }
  });
  window.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    const dx = (e.clientX - lastX) * 0.01, dy = (e.clientY - lastY) * 0.01;
    rotY += dx; rotX = clamp(rotX + dy, -0.9, 0.9);
    velY = dx; velX = dy * 0.5;
    lastX = e.clientX; lastY = e.clientY;
  });
  window.addEventListener('pointerup', function (e) {
    if (!dragging) return;
    dragging = false;
    const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
    if (moved < 7 && performance.now() - downT < 320 && inside(e.clientX, e.clientY)) {
      velY += 0.5; // tap = flip
    }
  });

  // ── Gyro (mobile tilt) ──
  function onOrient(ev) {
    if (ev.gamma == null) return;
    gy = clamp((ev.gamma || 0) / 45, -0.6, 0.6);
    gx = clamp(((ev.beta || 45) - 45) / 60, -0.4, 0.4);
  }
  function enableGyro() {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(function (s) { if (s === 'granted') window.addEventListener('deviceorientation', onOrient); }).catch(function () {});
      } else if (window.DeviceOrientationEvent) { window.addEventListener('deviceorientation', onOrient); }
    } catch (e) {}
  }
  enableGyro();
  window.addEventListener('touchstart', function once() { enableGyro(); window.removeEventListener('touchstart', once); }, { passive: true });

  // ── Loop ──
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function update() {
    requestAnimationFrame(update);
    if (!dragging) {
      rotY += (reduce ? 0 : 0.004) + velY;
      rotX += velX; rotX = clamp(rotX, -0.9, 0.9);
      velY *= 0.95; velX *= 0.9;
    }
    coin.rotation.y = rotY + gy * 0.5;
    coin.rotation.x = rotX + gx * 0.4;
    renderer.render(scene, camera);
  }
  update();

  function resize() {
    W = wrap.clientWidth || 400; H = wrap.clientHeight || 400;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  setTimeout(resize, 60); setTimeout(resize, 400);
})();
