import { chromium } from 'playwright-core';
import fs from 'fs';

const b = await chromium.launch({channel:'chrome', headless:true});

async function probe(w, h, tag) {
  const ctx = await b.newContext({viewport:{width:w,height:h}, deviceScaleFactor:1});
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:4500/', {waitUntil:'networkidle'});
  await p.waitForTimeout(600);
  const info = await p.evaluate(() => {
    const el = document.querySelector('.sc-scrim--hero-plate');
    if (!el) return {exists:false};
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const lead = document.querySelector('.sc-copy--lead');
    const lr = lead.getBoundingClientRect();
    return {
      exists: true,
      display: cs.display, opacity: cs.opacity,
      position: cs.position, zIndex: cs.zIndex,
      backgroundImage: cs.backgroundImage.slice(0, 220),
      backgroundColor: cs.backgroundColor,
      width: r.width, height: r.height,
      rect: {x:r.left, y:r.top, w:r.width, h:r.height},
      viewport: {w: innerWidth, h: innerHeight},
      leadRect: {x:lr.left, y:lr.top, w:lr.width, h:lr.height},
      leadOverlapsPlate: !(lr.right < r.left || lr.left > r.right || lr.bottom < r.top || lr.top > r.bottom),
      varCanvas: getComputedStyle(document.body).getPropertyValue('--sc-canvas').trim(),
      varCanvasHtml: getComputedStyle(document.documentElement).getPropertyValue('--sc-canvas').trim(),
      bodyClass: document.body.className,
    };
  });
  // element screenshot ALONE
  const el = await p.$('.sc-scrim--hero-plate');
  if (el) await el.screenshot({path: `lab/final/plate-${tag}.png`});
  // full hero crop for context (top of page)
  await p.screenshot({path: `lab/final/hero-${tag}.png`, clip: {x:0, y:0, width:w, height:h}});
  console.log(`=== ${tag} (${w}x${h}) ===`);
  console.log(JSON.stringify(info, null, 1));
  await ctx.close();
}

await probe(1440, 900, 'desktop');
await probe(390, 844, 'mobile');
await b.close();
