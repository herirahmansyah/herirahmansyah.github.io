import { chromium } from 'playwright-core';
const url = 'http://127.0.0.1:4500/#certificates';
const w = parseInt(process.argv[2],10), h = parseInt(process.argv[3],10);
const b = await chromium.launch({channel:'chrome', headless:true});
const ctx = await b.newContext({viewport:{width:w,height:h}});
const p = await ctx.newPage();
await p.goto(url, {waitUntil:'networkidle', timeout:20000});
await p.waitForTimeout(800);
const out = await p.evaluate(() => {
  const rail = document.querySelector('.cert-rail');
  const items = [...rail.children].map(c => ({
    cls: c.className.split(' ')[0],
    w: Math.round(c.getBoundingClientRect().width),
  }));
  const railW = Math.round(rail.scrollWidth);
  const inner = window.innerWidth;
  return {items, railW, inner, overflow: railW - inner};
});
await b.close();
console.log(JSON.stringify({vp:{w,h}, ...out}, null, 0));
