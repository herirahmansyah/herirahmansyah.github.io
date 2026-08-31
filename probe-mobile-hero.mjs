import { chromium } from 'playwright-core';
const b = await chromium.launch({channel:'chrome', headless:true});
const ctx = await b.newContext({viewport:{width:390,height:844}, deviceScaleFactor:1});
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:4500/', {waitUntil:'networkidle'});
await p.waitForTimeout(600);
// Tag fixed elements
await p.evaluate(() => {
  document.querySelectorAll('body *').forEach((el) => {
    if (getComputedStyle(el).position === 'fixed') el.setAttribute('data-sc-shot-fixed','');
  });
});
await p.addStyleTag({content: '[data-sc-cue],[data-sc-cue] *,[data-sc-copy],[data-copy] *,[data-sc-shot-fixed]{visibility:hidden!important}'});
const buf = await p.screenshot({type:'jpeg', quality:80});
const fs = await import('fs');
fs.writeFileSync('lab/final/L2-mobile/_bare_hero.jpg', buf);
// Get rect of .sc-copy--lead
const info = await p.evaluate(() => {
  const c = document.querySelector('.sc-copy--lead');
  const r = c.getBoundingClientRect();
  return {x:r.left, y:r.top, w:r.width, h:r.height, text:c.textContent.trim().slice(0,40), color:getComputedStyle(c).color};
});
console.log('lead rect:', info);
await b.close();
