/* ═══════════════════════════════════════════════
   HERO — interactive gold particle orb (Three.js)
   Drag to spin (momentum) · hover/finger scatters · tap to burst · gyro
═══════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('tooth3d');
  if (!canvas || typeof THREE === 'undefined') return;
  const wrap = canvas.parentElement;
  let W = wrap.clientWidth || 400, H = wrap.clientHeight || 400;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W, H, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
  camera.position.set(0, 0, 5);

  function makeSprite() {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,246,216,1)');
    g.addColorStop(0.4, 'rgba(232,201,122,0.95)');
    g.addColorStop(1, 'rgba(201,168,76,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  const isMobile = Math.min(W, H) < 380 || /Mobi|Android/i.test(navigator.userAgent || '');
  const N = isMobile ? 2400 : 3800;
  const R = 1.7;
  const pos = new Float32Array(N * 3);
  const home = new Float32Array(N * 3);
  const dir = new Float32Array(N * 3);
  const GA = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const tt = N > 1 ? i / (N - 1) : 0;
    const y = 1 - 2 * tt;
    const rr = Math.sqrt(Math.max(0, 1 - y * y));
    const a = GA * i;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    const i3 = i * 3;
    home[i3] = x * R; home[i3 + 1] = y * R; home[i3 + 2] = z * R;
    pos[i3] = home[i3]; pos[i3 + 1] = home[i3 + 1]; pos[i3 + 2] = home[i3 + 2];
    dir[i3] = x; dir[i3 + 1] = y; dir[i3 + 2] = z;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    size: isMobile ? 0.08 : 0.062, map: makeSprite(), color: 0xffffff,
    transparent: true, depthWrite: false, blending: THREE.NormalBlending, sizeAttenuation: true
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // ── Interaction state ──
  const mouse = new THREE.Vector2(0, 0);
  let hasPointer = false, dragging = false;
  let rotY = 0, rotX = -0.12, velY = 0.0016, velX = 0;
  let lastX = 0, lastY = 0, downX = 0, downY = 0, downT = 0;
  let burst = 0, gx = 0, gy = 0, t = 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function inside(cx, cy) {
    const r = canvas.getBoundingClientRect();
    return cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
  }
  canvas.addEventListener('pointerdown', function (e) {
    dragging = true; hasPointer = false;
    lastX = downX = e.clientX; lastY = downY = e.clientY; downT = performance.now();
    velY = 0; velX = 0;
    if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (x) {} }
  });
  window.addEventListener('pointermove', function (e) {
    if (dragging) {
      const dx = (e.clientX - lastX) * 0.01, dy = (e.clientY - lastY) * 0.01;
      rotY += dx; rotX = clamp(rotX + dy, -1.2, 1.2);
      velY = dx; velX = dy * 0.5;
      lastX = e.clientX; lastY = e.clientY;
    } else {
      const r = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      hasPointer = inside(e.clientX, e.clientY);
    }
  });
  window.addEventListener('pointerup', function (e) {
    if (!dragging) return;
    dragging = false;
    const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
    if (moved < 7 && performance.now() - downT < 320 && inside(e.clientX, e.clientY)) burst = 1; // tap = burst
  });

  // ── Gyro ──
  function onOrient(ev) { if (ev.gamma == null) return; gy = clamp((ev.gamma || 0) / 45, -0.6, 0.6); gx = clamp(((ev.beta || 45) - 45) / 60, -0.4, 0.4); }
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
  const RAD = 1.15, RAD2 = RAD * RAD, PUSH = 1.05;
  const _v = new THREE.Vector3(), worldP = new THREE.Vector3(), localP = new THREE.Vector3(999, 999, 999), inv = new THREE.Matrix4();

  function update() {
    requestAnimationFrame(update);
    t += 0.012;
    if (!dragging) {
      rotY += (reduce ? 0 : 0.0016) + velY;
      rotX += velX; rotX = clamp(rotX, -1.2, 1.2);
      velY *= 0.95; velX *= 0.9;
    }
    points.rotation.y = rotY + gy * 0.5;
    points.rotation.x = rotX + gx * 0.4;
    burst *= 0.9; if (burst < 0.002) burst = 0;

    let active = false;
    if (hasPointer && !dragging) {
      _v.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(camera.position).normalize();
      const O = camera.position;
      const b = 2 * (_v.x * O.x + _v.y * O.y + _v.z * O.z);
      const c = (O.x * O.x + O.y * O.y + O.z * O.z) - R * R;
      const disc = b * b - 4 * c;
      if (disc >= 0) {
        const s = (-b - Math.sqrt(disc)) / 2;
        worldP.set(O.x + _v.x * s, O.y + _v.y * s, O.z + _v.z * s);
        points.updateMatrixWorld();
        inv.copy(points.matrixWorld).invert();
        localP.copy(worldP).applyMatrix4(inv);
        active = true;
      }
    }

    const p = geo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      let push = burst * 1.3;
      if (active) {
        const dx = home[i3] - localP.x, dy = home[i3 + 1] - localP.y, dz = home[i3 + 2] - localP.z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < RAD2) { const d = Math.sqrt(d2) || 0.0001; push += (RAD - d) / RAD * PUSH; }
      }
      if (!reduce) push += 0.018 * Math.sin(t + i * 0.35);
      const tx = home[i3] + dir[i3] * push, ty = home[i3 + 1] + dir[i3 + 1] * push, tz = home[i3 + 2] + dir[i3 + 2] * push;
      p[i3] += (tx - p[i3]) * 0.15;
      p[i3 + 1] += (ty - p[i3 + 1]) * 0.15;
      p[i3 + 2] += (tz - p[i3 + 2]) * 0.15;
    }
    geo.attributes.position.needsUpdate = true;
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
