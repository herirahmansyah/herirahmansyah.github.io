/**
 * boids.js — Flocking Animation for herirahmansyah.github.io
 * Cara pakai: tambahkan <script src="boids.js"></script>
 * sebelum tag </body> di index.html
 *
 * Otomatis inject canvas ke dalam section#home sebagai background.
 * Tidak merusak layout atau styling yang sudah ada.
 */

(function () {
  /* ── 1. Buat canvas & inject ke hero section ── */
  const hero = document.querySelector('#home') || document.querySelector('.hero') || document.body;

  const canvas = document.createElement('canvas');
  canvas.id = 'boids-canvas';

  Object.assign(canvas.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    zIndex: '0',
    pointerEvents: 'none',   // klik tetap tembus ke elemen di bawah
    opacity: '0.85',
  });

  // Pastikan hero punya position supaya canvas absolute bisa nempel
  const heroPos = getComputedStyle(hero).position;
  if (heroPos === 'static') hero.style.position = 'relative';

  // Canvas masuk paling depan agar tidak nutup konten
  hero.insertBefore(canvas, hero.firstChild);

  const ctx = canvas.getContext('2d');

  /* ── 2. Ukuran responsif ── */
  let W, H;
  function resize() {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); });

  /* ── 3. Deteksi dark / light mode ── */
  function isDark() {
    // Cek body class atau prefers-color-scheme
    if (document.body.classList.contains('dark')) return true;
    if (document.documentElement.getAttribute('data-theme') === 'dark') return true;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /* Palet warna — emerald/teal cocok untuk AI / tech portfolio */
  const PALETTE = {
    dark:  ['#6ee7b7', '#38bdf8', '#a78bfa', '#f472b6', '#fbbf24'],
    light: ['#059669', '#0284c7', '#7c3aed', '#db2777', '#d97706'],
  };

  function getColors() {
    return isDark() ? PALETTE.dark : PALETTE.light;
  }

  /* Background overlay — semi-transparan, preserve hero bg asli */
  function getBgColor() {
    return isDark()
      ? 'rgba(10, 15, 30, 0.20)'   // dark: overlay gelap tipis
      : 'rgba(255, 255, 255, 0.18)'; // light: overlay putih tipis
  }

  /* ── 4. Kelas Boid ── */
  const VISUAL_RANGE = 80;
  const AVOID_RANGE  = 22;
  const SPEED_MAX    = 3.0;
  const SPEED_MIN    = 0.8;
  const TRAIL_LEN    = 12;

  class Boid {
    constructor(colors) {
      this.reset(colors);
    }

    reset(colors) {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.vx    = (Math.random() - 0.5) * 2;
      this.vy    = (Math.random() - 0.5) * 2;
      this.size  = 3 + Math.random() * 2.5;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.trail = [];
    }

    update(all) {
      let sepX = 0, sepY = 0, sepN = 0;
      let aliX = 0, aliY = 0;
      let cohX = 0, cohY = 0, cohN = 0;

      for (const b of all) {
        if (b === this) continue;
        const dx = b.x - this.x;
        const dy = b.y - this.y;
        const d  = Math.sqrt(dx * dx + dy * dy);

        if (d < AVOID_RANGE && d > 0) {
          sepX -= dx / d;
          sepY -= dy / d;
          sepN++;
        }
        if (d < VISUAL_RANGE) {
          aliX += b.vx; aliY += b.vy;
          cohX += b.x;  cohY += b.y;
          cohN++;
        }
      }

      // Separation
      if (sepN > 0) {
        this.vx += sepX * 0.07;
        this.vy += sepY * 0.07;
      }
      // Alignment + Cohesion
      if (cohN > 0) {
        this.vx += (aliX / cohN - this.vx) * 0.04;
        this.vy += (aliY / cohN - this.vy) * 0.04;
        this.vx += (cohX / cohN - this.x)  * 0.003;
        this.vy += (cohY / cohN - this.y)  * 0.003;
      }

      // Batas layar — steering halus
      const M = 50;
      if (this.x < M)     this.vx += 0.3;
      if (this.x > W - M) this.vx -= 0.3;
      if (this.y < M)     this.vy += 0.3;
      if (this.y > H - M) this.vy -= 0.3;

      // Mouse attract
      if (mouse) {
        const mdx = mouse.x - this.x;
        const mdy = mouse.y - this.y;
        const md  = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 150 && md > 0) {
          const f = (1 - md / 150) * 0.08;
          this.vx += mdx * f;
          this.vy += mdy * f;
        }
      }

      // Speed clamp
      const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (spd > SPEED_MAX) { this.vx = (this.vx / spd) * SPEED_MAX; this.vy = (this.vy / spd) * SPEED_MAX; }
      if (spd < SPEED_MIN) { this.vx += (Math.random() - 0.5) * 0.3; this.vy += (Math.random() - 0.5) * 0.3; }

      // Trail
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > TRAIL_LEN) this.trail.shift();

      this.x += this.vx;
      this.y += this.vy;
    }

    draw() {
      const angle = Math.atan2(this.vy, this.vx);
      const s     = this.size;

      /* Trail */
      if (this.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
          ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.strokeStyle = this.color + '30';
        ctx.lineWidth   = 1;
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);

      /* Badan ikan — ellipse */
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 1.8, s * 0.65, 0, 0, Math.PI * 2);
      ctx.fillStyle = this.color + 'bb';
      ctx.fill();

      /* Sirip ekor */
      ctx.beginPath();
      ctx.moveTo(-s * 1.6, 0);
      ctx.lineTo(-s * 2.6, -s * 0.9);
      ctx.lineTo(-s * 2.6,  s * 0.9);
      ctx.closePath();
      ctx.fillStyle = this.color + '77';
      ctx.fill();

      /* Mata */
      ctx.beginPath();
      ctx.arc(s * 0.6, -s * 0.15, s * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = isDark() ? '#0a0f1e' : '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s * 0.65, -s * 0.15, s * 0.09, 0, Math.PI * 2);
      ctx.fillStyle = isDark() ? '#ffffff' : '#1e293b';
      ctx.fill();

      ctx.restore();
    }
  }

  /* ── 5. Garis koneksi antar boid terdekat ── */
  function drawConnections(colors) {
    const MAX_CONN_DIST = 70;
    for (let i = 0; i < boids.length; i++) {
      for (let j = i + 1; j < boids.length; j++) {
        const dx = boids[i].x - boids[j].x;
        const dy = boids[i].y - boids[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_CONN_DIST) {
          ctx.beginPath();
          ctx.moveTo(boids[i].x, boids[i].y);
          ctx.lineTo(boids[j].x, boids[j].y);
          const alpha = Math.round((1 - d / MAX_CONN_DIST) * 40).toString(16).padStart(2, '0');
          ctx.strokeStyle = colors[0] + alpha;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  /* ── 6. Init boids ── */
  const BOID_COUNT = 55;
  let boids = [];

  function initBoids() {
    const colors = getColors();
    boids = Array.from({ length: BOID_COUNT }, () => new Boid(colors));
  }
  initBoids();

  // Re-warna saat dark mode toggle (MutationObserver untuk class/attr changes)
  const observer = new MutationObserver(() => {
    const colors = getColors();
    boids.forEach(b => { b.color = colors[Math.floor(Math.random() * colors.length)]; });
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* ── 7. Loop animasi ── */
  function loop() {
    const colors = getColors();

    /* Trail fade — overlay semi-transparan setiap frame */
    ctx.fillStyle = getBgColor();
    ctx.fillRect(0, 0, W, H);

    /* Koneksi dulu (di bawah ikan) */
    drawConnections(colors);

    /* Update + draw tiap boid */
    for (const b of boids) {
      b.update(boids);
      b.draw();
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  /* ── 8. Mouse attract — listen di document level ── */
  let mouse = null;
  document.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();
    if (
      e.clientY >= heroRect.top &&
      e.clientY <= heroRect.bottom &&
      e.clientX >= heroRect.left &&
      e.clientX <= heroRect.right
    ) {
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    } else {
      mouse = null;
    }
  });

  /* ── 9. Export helper — bisa dipakai dari luar jika perlu ── */
  window.BoidsHero = {
    scatter() {
      boids.forEach(b => {
        b.vx = (Math.random() - 0.5) * 10;
        b.vy = (Math.random() - 0.5) * 10;
      });
    },
    reinit: initBoids,
  };

})();
