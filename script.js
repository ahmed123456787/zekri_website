/* ═══════════════════════════════════════════════
   INTERNATIONALIZATION (EN / FR / AR)
═══════════════════════════════════════════════ */
const htmlEl = document.documentElement;
let currentLang = localStorage.getItem('zekri-lang') || 'en';

function applyLanguage(lang) {
  const dict = TRANSLATIONS[lang];
  if (!dict) return;
  currentLang = lang;

  // Document direction & lang
  htmlEl.setAttribute('lang', lang);
  htmlEl.setAttribute('dir', dict.dir);
  document.body.classList.toggle('is-rtl', dict.dir === 'rtl');

  // Text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = dict[el.getAttribute('data-i18n')];
    if (val !== undefined) el.textContent = val;
  });

  // HTML content (allows <em>, <br>)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const val = dict[el.getAttribute('data-i18n-html')];
    if (val !== undefined) el.innerHTML = val;
  });

  // Placeholders
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const val = dict[el.getAttribute('data-i18n-ph')];
    if (val !== undefined) el.setAttribute('placeholder', val);
  });

  // Language switcher label
  const labelMap = { en: 'EN', fr: 'FR', ar: 'AR' };
  const langCurrent = document.getElementById('langCurrent');
  if (langCurrent) langCurrent.textContent = labelMap[lang];

  // Mark active item in menu
  document.querySelectorAll('#langMenu button').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-lang') === lang);
  });

  localStorage.setItem('zekri-lang', lang);
}

// Language switcher dropdown
const langSwitch = document.getElementById('langSwitch');
const langBtn = document.getElementById('langBtn');
const langMenu = document.getElementById('langMenu');

langBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  langSwitch.classList.toggle('open');
});

document.querySelectorAll('#langMenu button').forEach(btn => {
  btn.addEventListener('click', () => {
    applyLanguage(btn.getAttribute('data-lang'));
    langSwitch.classList.remove('open');
  });
});

document.addEventListener('click', (e) => {
  if (!langSwitch.contains(e.target)) langSwitch.classList.remove('open');
});

// Apply saved language on load
applyLanguage(currentLang);

/* ═══════════════════════════════════════════════
   THEME TOGGLE
═══════════════════════════════════════════════ */
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-toggle__icon');

const savedTheme = localStorage.getItem('zekri-theme') || 'light';
html.setAttribute('data-theme', savedTheme);
themeIcon.textContent = savedTheme === 'dark' ? '☾' : '☀';

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  themeIcon.textContent = next === 'dark' ? '☾' : '☀';
  localStorage.setItem('zekri-theme', next);
});

/* ═══════════════════════════════════════════════
   NAV SCROLL STATE
═══════════════════════════════════════════════ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ═══════════════════════════════════════════════
   MOBILE MENU
═══════════════════════════════════════════════ */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

/* ═══════════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════════ */
const revealEls = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => observer.observe(el));

/* ═══════════════════════════════════════════════
   SMOOTH ANCHOR LINKS
═══════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - offset,
      behavior: 'smooth'
    });
  });
});

/* ═══════════════════════════════════════════════
   BOOKING FORM
═══════════════════════════════════════════════ */
/* Google Apps Script Web App URL — appointment submissions go straight to your Sheet */
const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxdVDyIWgxhanCvJF7CAAhcO1zAxgv3y1NvHVWGKG3dyjgA_yPnr90EJPEd5sge1c0w/exec';

function handleBooking(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const success = document.getElementById('formSuccess');
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const original = btn.textContent;
  btn.textContent = dict['form.sending'] || 'Sending…';
  btn.disabled = true;

  const get = (id) => {
    const el = document.getElementById(id);
    if (!el) return '';
    if (el.type === 'checkbox') return el.checked ? 'Yes' : 'No';
    if (el.tagName === 'SELECT') return el.options[el.selectedIndex] ? el.options[el.selectedIndex].text.trim() : el.value;
    return el.value;
  };
  const data = {
    timestamp: new Date().toLocaleString(),
    language: currentLang,
    firstName: get('fname'), lastName: get('lname'), age: get('age'),
    phone: get('phone'), country: get('country'), wilaya: get('wilaya'),
    treatment: get('problem'), restoration: get('treattype'),
    reason: get('why'), agreedTerms: get('terms')
  };

  function finish() {
    btn.textContent = original;
    btn.disabled = false;
    if (success) { success.classList.add('visible'); setTimeout(() => success.classList.remove('visible'), 6000); }
    form.reset();
    const zb = document.getElementById('zirconiaBlock'); if (zb) zb.hidden = true;
  }

  if (SHEET_ENDPOINT) {
    fetch(SHEET_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    }).then(function () { setTimeout(finish, 500); })
      .catch(function () { setTimeout(finish, 500); });
  } else {
    setTimeout(finish, 1000);
  }
}

/* ═══════════════════════════════════════════════
   ANIMATED COUNTER
═══════════════════════════════════════════════ */
function animateCounter(el, target, suffix) {
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(eased * target);
    el.textContent = value.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const numEls = entry.target.querySelectorAll('.stat__num');
      const data = [
        { target: 8, suffix: '+' },
        { target: 30000, suffix: '+' },
        { target: 24, suffix: '+' },
        { target: 85, suffix: '%' }
      ];
      numEls.forEach((el, i) => {
        if (data[i]) animateCounter(el, data[i].target, data[i].suffix);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero__stats');
if (heroStats) statsObserver.observe(heroStats);

/* ═══════════════════════════════════════════════
   VIDEO GALLERY — hover preview + lightbox
═══════════════════════════════════════════════ */
document.querySelectorAll('.vcard').forEach(card => {
  const video = card.querySelector('.vcard__video');

  // Hover plays a muted inline preview (only if the file actually loads)
  card.addEventListener('mouseenter', () => {
    if (video) video.play().catch(() => {});
  });
  card.addEventListener('mouseleave', () => {
    if (video) { video.pause(); video.currentTime = 0; }
  });

  // Click opens the fullscreen lightbox
  card.addEventListener('click', () => {
    const src = card.getAttribute('data-video');
    const key = card.getAttribute('data-title-key');
    const dict = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[currentLang]) || {};
    const title = (key && dict[key]) || '';
    openVideoLightbox(src, title);
  });
});

function closeLightbox(box) {
  box.style.animation = 'fadeIn 0.2s ease reverse';
  setTimeout(() => box.remove(), 180);
  document.removeEventListener('keydown', box._esc);
}

function openVideoLightbox(src, title) {
  const box = document.createElement('div');
  box.className = 'vlightbox';

  const dict = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[currentLang]) || {};
  const soonMsg = {
    en: 'Video coming soon',
    fr: 'Vidéo bientôt disponible',
    ar: 'الفيديو قريباً'
  }[currentLang] || 'Video coming soon';

  box.innerHTML = `
    <div class="vlightbox__inner">
      <button class="vlightbox__close" aria-label="Close">✕</button>
      <video src="${src}" controls autoplay playsinline></video>
      <div class="vlightbox__title">${title}</div>
    </div>`;

  const inner = box.querySelector('.vlightbox__inner');
  const videoEl = box.querySelector('video');

  // If the video file isn't there yet, show a graceful "coming soon" panel
  videoEl.addEventListener('error', () => {
    videoEl.outerHTML = `
      <div class="vlightbox__msg">
        <svg viewBox="0 0 24 24"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
        <strong>${title}</strong>
        <span>${soonMsg}</span>
      </div>`;
  });

  box._esc = (e) => { if (e.key === 'Escape') closeLightbox(box); };
  document.addEventListener('keydown', box._esc);
  box.addEventListener('click', (e) => { if (e.target === box) closeLightbox(box); });
  box.querySelector('.vlightbox__close').addEventListener('click', () => closeLightbox(box));

  document.body.appendChild(box);
}

/* ═══════════════════════════════════════════════
   APPOINTMENTS — conditional restoration block
═══════════════════════════════════════════════ */
(function () {
  const problem = document.getElementById('problem');
  const block = document.getElementById('zirconiaBlock');
  const tt = document.getElementById('treattype');
  if (!problem || !block) return;
  problem.addEventListener('change', function () {
    const show = problem.value === 'zirconia';
    block.hidden = !show;
    if (tt) { tt.required = show; if (!show) tt.selectedIndex = 0; }
  });
})();

/* ═══════════════════════════════════════════════
   LEGACY FILM — autoplay muted when scrolled into view
═══════════════════════════════════════════════ */
(function () {
  const lv = document.querySelector('.legacy__video');
  if (!lv) return;
  lv.muted = true;            // required for autoplay
  let started = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const p = lv.play();
        if (p) p.then(() => { started = true; }).catch(() => {});
      } else if (started) {
        lv.pause();           // only pause after it has actually played
      }
    });
  }, { threshold: 0.2 });
  io.observe(lv);
})();

/* ═══════════════════════════════════════════════
   HERO — interactive 3D tilt + cursor spotlight
═══════════════════════════════════════════════ */
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  const content = hero.querySelector('.hero__content');
  const bg = hero.querySelector('.hero__bg');
  const MAX = 13;           // tilt degrees
  let tx = 0, ty = 0, cx = 0, cy = 0, idle = true, t = 0;

  function frame() {
    if (idle) { tx = 0; ty = 0; }
    cx += (tx - cx) * 0.07;
    cy += (ty - cy) * 0.07;
    /* text tilt removed per request */
    /* bg parallax removed */
    hero.style.setProperty('--spot-x', ((cx + 0.5) * 100) + '%');
    hero.style.setProperty('--spot-y', ((cy + 0.5) * 100) + '%');
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // PC — mouse drives the tilt
  hero.addEventListener('mousemove', function (e) {
    idle = false;
    const r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
  });
  hero.addEventListener('mouseleave', function () { idle = true; });

  // Mobile — gyroscope drives the tilt
  function onOrient(e) {
    if (e.gamma == null && e.beta == null) return;
    idle = false;
    tx = Math.max(-0.5, Math.min(0.5, (e.gamma || 0) / 38));
    ty = Math.max(-0.5, Math.min(0.5, ((e.beta || 45) - 45) / 38));
  }
  function enableGyro() {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(function (s) { if (s === 'granted') window.addEventListener('deviceorientation', onOrient); }).catch(function () {});
      } else if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', onOrient);
      }
    } catch (err) {}
  }
  enableGyro(); // Android works immediately
  // iOS needs a tap to grant motion permission
  window.addEventListener('touchstart', function once() { enableGyro(); window.removeEventListener('touchstart', once); }, { passive: true });
})();
