/* Small helpers. Rectangles are { l, t, r, b } unless noted. */
(function (FK) {
  'use strict';

  const U = {
    clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; },
    rand(lo, hi) { return lo + Math.random() * (hi - lo); },

    rect(x, y, w, h) { return { l: x, t: y, r: x + w, b: y + h }; },

    overlap(a, b) {
      return a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
    },

    /** Edge-to-edge distance between two rectangles (0 if they touch or overlap). */
    gap(a, b) {
      const gx = Math.max(0, a.l - b.r, b.l - a.r);
      const gy = Math.max(0, a.t - b.b, b.t - a.b);
      return Math.hypot(gx, gy);
    },

    /** Shrink a rectangle by a fraction of its width / height on every side. */
    inset(r, f) {
      const dx = (r.r - r.l) * f, dy = (r.b - r.t) * f;
      return { l: r.l + dx, t: r.t + dy, r: r.r - dx, b: r.b - dy };
    },

    /** Size of a sprite drawn `h` px tall, keeping its aspect ratio. */
    spriteSize(name, h) {
      const img = FK.Assets && FK.Assets.image(name);
      const s = FK.SPRITE_SIZE[name];
      const ratio = img ? img.naturalWidth / img.naturalHeight : s.w / s.h;
      return { w: h * ratio, h };
    },

    /** Ghost_Bounds: the opaque part of a sprite drawn centered on (cx, cy). */
    spriteBounds(name, cx, cy, h) {
      const sz = U.spriteSize(name, h);
      const b = FK.SPRITE_BOUNDS[name];
      const x0 = cx - sz.w / 2, y0 = cy - sz.h / 2;
      return { l: x0 + b.l * sz.w, t: y0 + b.t * sz.h, r: x0 + b.r * sz.w, b: y0 + b.b * sz.h };
    },

    /** Draw an image so that its opaque bounding box exactly fills `dest` ({l,t,r,b}). */
    drawFitted(ctx, img, name, dest) {
      const b = FK.SPRITE_BOUNDS[name];
      const bw = (b.r - b.l) * img.naturalWidth, bh = (b.b - b.t) * img.naturalHeight;
      const sx = (dest.r - dest.l) / bw, sy = (dest.b - dest.t) / bh;
      ctx.drawImage(
        img,
        dest.l - b.l * img.naturalWidth * sx, dest.t - b.t * img.naturalHeight * sy,
        img.naturalWidth * sx, img.naturalHeight * sy
      );
    },

    roundRectPath(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    },
  };

  FK.U = U;
  if (typeof module !== 'undefined') module.exports = U;
})(typeof window !== 'undefined' ? (window.FK = window.FK || {}) : {});
