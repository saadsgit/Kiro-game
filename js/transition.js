/* Door transition: fade to black, hold, fade back in. Update it only with the game's dt, so a pause freezes it. */
(function (FK) {
  'use strict';

  const C = FK.C;
  const TOTAL = C.FADE_OUT + C.FADE_HOLD + C.FADE_IN;

  FK.Transition = {
    create() { return { t: 0, switched: false, alpha: 0, done: false }; },

    /** Returns { switchNow, done }. `switchNow` is true exactly once, when the screen is fully black. */
    update(tr, dt) {
      tr.t += dt;
      if (tr.t < C.FADE_OUT) tr.alpha = tr.t / C.FADE_OUT;
      else if (tr.t < C.FADE_OUT + C.FADE_HOLD) tr.alpha = 1;
      else tr.alpha = Math.max(0, 1 - (tr.t - C.FADE_OUT - C.FADE_HOLD) / C.FADE_IN);

      let switchNow = false;
      if (!tr.switched && tr.t >= C.FADE_OUT) { tr.switched = true; switchNow = true; }
      tr.done = tr.t >= TOTAL;
      return { switchNow, done: tr.done };
    },

    /** Black overlay over the playfield only, so the status bar stays visible. */
    draw(ctx, tr) {
      if (tr.alpha <= 0) return;
      ctx.fillStyle = 'rgba(0,0,0,' + tr.alpha.toFixed(3) + ')';
      ctx.fillRect(0, 0, C.W, C.FIELD_H);
    },
  };
})(window.FK = window.FK || {});
