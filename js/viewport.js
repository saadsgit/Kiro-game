/* Scaling: keeps the 16:9 canvas as large as the window allows, sharp on high-density screens. */
(function (FK) {
  'use strict';

  let canvas = null;
  let ctx = null;

  function resize() {
    const C = FK.C;
    const s = Math.min(window.innerWidth / C.W, window.innerHeight / C.H);
    const cssW = Math.max(1, Math.floor(C.W * s));
    const cssH = Math.max(1, Math.floor(C.H * s));
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.style.maxHeight = 'none';
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(canvas.width / C.W, 0, 0, canvas.height / C.H, 0, 0);
    ctx.imageSmoothingEnabled = true;
  }

  FK.Viewport = {
    init(el) {
      canvas = el;
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
      return ctx;
    },
    resize,
    /** Convert a pointer position in the page to logical 1280 x 720 coordinates. */
    toLogical(clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      return {
        x: ((clientX - r.left) / r.width) * FK.C.W,
        y: ((clientY - r.top) / r.height) * FK.C.H,
      };
    },
  };
})(window.FK = window.FK || {});
