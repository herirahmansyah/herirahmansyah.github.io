import { chromium } from 'playwright-core';
const URL = 'http://127.0.0.1:4600/';
const b = await chromium.launch({ channel: 'chrome', headless: true });

async function run(w, h, mode, tag) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1,
    colorScheme: mode === 'dark' ? 'dark' : 'light' });
  const p = await ctx.newPage();
  const errs = [];
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await p.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  // script.js picks the theme from prefers-color-scheme; pin it explicitly so a
  // "dark" run cannot silently shoot the light palette.
  await p.evaluate(m => {
    document.body.classList.toggle('dark', m === 'dark');
    document.body.classList.toggle('light', m !== 'dark');
  }, mode);
  await p.waitForTimeout(400);

  // scroll the whole document so every lazy image + reveal fires
  await p.evaluate(async () => {
    const step = innerHeight * 0.6;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y); await new Promise(r => setTimeout(r, 120));
    }
  });
  await p.waitForTimeout(600);

  const geom = await p.evaluate(() => {
    const rows = sel => {
      const g = document.querySelector(sel);
      if (!g) return null;
      const kids = [...g.children];
      const tops = [...new Set(kids.map(k => Math.round(k.getBoundingClientRect().top)))];
      const cs = getComputedStyle(g);
      return {
        cols: cs.gridTemplateColumns.split(' ').length,
        colWidths: cs.gridTemplateColumns,
        items: kids.length,
        rows: tops.length,
        scrollW: Math.round(g.scrollWidth),
        clientW: Math.round(g.clientWidth),
        overflowX: Math.round(g.scrollWidth - g.clientWidth),
      };
    };
    return {
      theme: document.body.className,
      docScrollH: document.documentElement.scrollHeight,
      viewportHeights: +(document.documentElement.scrollHeight / innerHeight).toFixed(2),
      viewport: { w: innerWidth, h: innerHeight },
      docScrollW: document.documentElement.scrollWidth,
      pageOverflowX: document.documentElement.scrollWidth - innerWidth,
      portfolio: rows('.portfolio-grid'),
      certs: rows('.cert-grid'),
      pinnedActs: [...document.querySelectorAll('[data-sc-act]')].map(a => ({
        id: a.id || a.getAttribute('data-sc-act'),
        act: a.getAttribute('data-sc-act'),
        inlineHeight: a.style.height || '(none)',
      })),
      deadSelectors: {
        railsLeft: document.querySelectorAll('.portfolio-rail, .cert-rail, [data-sc-pan]').length,
        stagesLeft: document.querySelectorAll('.portfolio-stage, .cert-stage').length,
      },
    };
  });

  for (const [sel, name] of [['.portfolio-grid', 'portfolio'], ['.cert-grid', 'certificates']]) {
    const el = await p.$(sel);
    await el.scrollIntoViewIfNeeded();
    await p.waitForTimeout(500);
    await el.screenshot({ path: `lab/final/static-grid/${name}-${tag}-r2.png` });
  }
  console.log(`### ${tag} (${w}x${h} ${mode})`);
  console.log(JSON.stringify(geom, null, 1));
  if (errs.length) console.log('CONSOLE:', errs.slice(0, 8));
  await ctx.close();
}

await run(1440, 900, 'dark', 'desktop-dark');
await run(1440, 900, 'light', 'desktop-light');
await run(390, 844, 'dark', 'mobile-dark');
await run(390, 844, 'light', 'mobile-light');
await b.close();
