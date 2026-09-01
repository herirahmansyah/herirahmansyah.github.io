/* scrollcraft.js — ScrollCraft foundation (no-op).
 *
 * Progressive-enhancement contract:
 *   1. mount() wires every observer and listener FIRST.
 *   2. ONLY at the very end it adds <html class="sc-active sc-ready">.
 *   3. With JS blocked or a mid-mount throw, the classes never land and the
 *      CSS rules (gated behind html.sc-active) stay inert — the page renders
 *      fully visible.
 *
 * This is a no-op foundation: no element carries a data-sc-* attribute yet,
 * so mount() walks an empty tree and the engine idles. The contract is ready
 * for the moment data-sc-* attributes are added to the markup.
 */
(function (global) {
  'use strict';

  var docEl = document.documentElement;
  var vh = innerHeight, vw = innerWidth;
  var y = 0;
  var reduce = false;

  // ---- utilities ------------------------------------------------------------
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function smooth(x) { x = clamp01(x); return x * x * (3 - 2 * x); }

  // ---- mount ----------------------------------------------------------------
  function mount(root) {
    if (!root) root = document.body;
    reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Collect acts (sections with data-sc-act).
    var acts = [];
    Array.prototype.forEach.call(root.querySelectorAll('[data-sc-act]'), function (el) {
      var actName = (el.getAttribute('data-sc-act') || '').trim();
      var sp = parseFloat(el.getAttribute('data-sc-span'));
      var act = { el: el, span: isNaN(sp) ? null : sp,
        top: 0, height: 0, raw: 0, p: 0, live: false, parked: false,
        // scrub and pin both play their animation across the act's own scroll
        // travel (height - vh), so both use the same raw mapping.
        pinned: actName === 'pin' || actName === 'scrub', cues: [], reveals: [] };
      acts.push(act);
    });

    // Cues per act — none exist yet.
    function gatherCues(act) {
      Array.prototype.forEach.call(act.el.querySelectorAll('[data-sc-cue]'), function (c) {
        var nums = (c.getAttribute('data-sc-cue') || '').trim().split(/\s+/).map(parseFloat);
        act.cues.push({
          el: c, from: isNaN(nums[0]) ? 0 : nums[0],
          to: nums.length > 1 && !isNaN(nums[1]) ? nums[1] : null,
          rIn: nums.length > 2 && !isNaN(nums[2]) ? clamp01(nums[2]) : 0.3,
          rOut: nums.length > 3 && !isNaN(nums[3]) ? clamp01(nums[3]) : 0.3,
          units: null, state: -1
        });
      });
    }
    acts.forEach(function (a) { gatherCues(a); });

    // Reveals per act — none exist yet.
    acts.forEach(function (a) {
      Array.prototype.forEach.call(a.el.querySelectorAll('[data-sc-reveal]'), function (c) {
        var nums = (c.getAttribute('data-sc-reveal-at') || '0 0.5').trim().split(/\s+/).map(parseFloat);
        a.reveals.push({ el: c, dir: c.getAttribute('data-sc-reveal') || 'up', from: nums[0] || 0, to: nums[1] || 0.5 });
      });
    });

    // ---- IntersectionObserver for [data-sc-in] (flow reveal) ----------------
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          el.classList.add('sc-in');
          var stagger = parseFloat(el.getAttribute('data-sc-stagger'));
          if (!isNaN(stagger)) {
            Array.prototype.forEach.call(el.children, function (kid, i) {
              kid.style.transitionDelay = (i * stagger) + 'ms';
              kid.classList.add('sc-in');
            });
          }
          io.unobserve(el);
        });
      }, { threshold: 0.15 });
      Array.prototype.forEach.call(root.querySelectorAll('[data-sc-in]'), function (el) { io.observe(el); });
    } else {
      // Fallback: no IO → show everything immediately.
      Array.prototype.forEach.call(root.querySelectorAll('[data-sc-in]'), function (el) {
        el.classList.add('sc-in');
        var stagger = parseFloat(el.getAttribute('data-sc-stagger'));
        if (!isNaN(stagger)) {
          Array.prototype.forEach.call(el.children, function (kid) { kid.classList.add('sc-in'); });
        }
      });
    }

    // ---- layout -------------------------------------------------------------
    function layout() {
      vh = innerHeight; vw = innerWidth;
      acts.forEach(function (a) {
        // An act with data-sc-span reserves that many viewports of scroll for
        // its animation. The stage (sticky, 100svh) stays pinned while the act
        // scrolls through the extra height.
        if (a.span !== null) a.el.style.height = (a.span * 100) + 'vh';
        var r = a.el.getBoundingClientRect();
        a.top = r.top + scrollY;
        a.height = r.height;
      });
    }

    // ---- read (scroll handler) ----------------------------------------------
    function read() {
      y = scrollY || pageYOffset;
      acts.forEach(function (a) {
        if (a.pinned) {
          a.raw = clamp01((y - a.top) / Math.max(a.height - vh, 1));
        } else {
          a.raw = clamp01((y + vh - a.top) / (a.height + vh));
        }
        a.p = a.raw;
        a.live = (y > a.top - vh * 1.25) && (y < a.top + a.height + vh * 1.25);

        if (!a.live) {
          if (a.parked !== true) {
            a.cues.forEach(function (q) { q.el.style.opacity = '0'; q.state = 0; });
            a.parked = true;
          }
          return;
        }
        a.parked = false;

        // cues
        a.cues.forEach(function (q) {
          var vis;
          if (q.to === null) {
            vis = smooth((a.p - q.from) / 0.18);
          } else {
            var win = Math.max(q.to - q.from, 0.001);
            var inEnd = q.from + win * q.rIn;
            var outStart = q.to - win * q.rOut;
            if (a.p < inEnd) vis = smooth((a.p - q.from) / Math.max(inEnd - q.from, 0.001));
            else if (a.p <= outStart) vis = 1;
            else vis = smooth(1 - (a.p - outStart) / Math.max(q.to - outStart, 0.001));
          }
          vis = clamp01(vis);
          q.el.style.opacity = vis.toFixed(3);
          q.el.style.transform = reduce ? 'none' : 'translate3d(0,' + ((1 - vis) * 2.4).toFixed(2) + 'vh,0)';
        });

        // reveals
        a.reveals.forEach(function (R) {
          var t = smooth((a.p - R.from) / Math.max(R.to - R.from, 0.001));
          var pct = ((1 - t) * 100).toFixed(2);
          R.el.style.clipPath = R.dir === 'up' ? 'inset(0 0 ' + pct + '% 0)' : 'inset(' + pct + '% 0 0 0)';
        });
      });
    }

    // ---- tick (rAF loop) ----------------------------------------------------
    function tick() { requestAnimationFrame(tick); }
    requestAnimationFrame(tick);

    // ---- wiring -------------------------------------------------------------
    var ticking = false;
    addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(function () { read(); ticking = false; }); }
    }, { passive: true });
    addEventListener('resize', function () { layout(); }, { passive: true });

    layout();
    // Apply the initial state immediately: layout() only measures geometry, so
    // an act's cues sit at their CSS default (opacity 0 behind html.sc-active)
    // until the first scroll. read() right here paints the real first frame.
    read();
    // Only now, at the end of mount(), arm the hidden state.
    docEl.classList.add('sc-active');
    docEl.classList.add('sc-ready');

    return { layout: layout, read: read, acts: acts };
  }

  global.ScrollCraft = { mount: mount };

})(window);