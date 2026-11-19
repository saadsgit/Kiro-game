/* Decorative clouds: semi-transparent, each with its own speed for a sense of depth. */
(function (FK) {
  'use strict';

  const C = FK.C, U = FK.U;

  function randomY(h) { return U.rand(20, C.FIELD_H - h - 20); }

  function make(startX) {
    const k = Math.random();                       // size factor: bigger = faster = "closer"
    const w = 70 + 80 * k;
    const h = w * 0.5;
    return {
      x: startX, y: randomY(h), w, h,
      speed: C.CLOUD_SPEED_MIN + (C.CLOUD_SPEED_MAX - C.CLOUD_SPEED_MIN) * k,
      alpha: U.rand(C.CLOUD_ALPHA_MIN, C.CLOUD_ALPHA_MAX),
    };
  }

  FK.Clouds = {
    create() {
      const list = [];
      for (let i = 0; i < C.CLOUD_COUNT; i++) list.push(make(U.rand(0, C.W)));
      return list;
    },

    update(list, dt) {
      for (const c of list) {
        c.x -= c.speed * dt;
        if (c.x + c.w < 0) {
          const k = Math.random();
          c.w = 70 + 80 * k;
          c.h = c.w * 0.5;
          c.speed = C.CLOUD_SPEED_MIN + (C.CLOUD_SPEED_MAX - C.CLOUD_SPEED_MIN) * k;
          c.alpha = U.rand(C.CLOUD_ALPHA_MIN, C.CLOUD_ALPHA_MAX);
          c.x = C.W;
          c.y = randomY(c.h);
        }
      }
    },

    draw(ctx, list) {
      for (const c of list) {
        ctx.save();
        ctx.globalAlpha = c.alpha;
        ctx.fillStyle = '#ffffff';
        U.roundRectPath(ctx, c.x, c.y, c.w, c.h, c.h * 0.3);
        ctx.fill();
        ctx.restore();
      }
    },
  };
})(window.FK = window.FK || {});
