/* Input: keyboard, mouse and touch, polled once per frame by game.js. */
(function (FK) {
  'use strict';

  const held = new Set();          // arrow keys currently down
  let flap = false;
  let muteToggle = false;
  let pointerHeld = false;
  let pointerId = null;
  let target = null;               // logical point being held

  const ARROWS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

  function onKeyDown(e) {
    if (e.code === 'Space' || ARROWS.indexOf(e.code) >= 0) e.preventDefault();
    if (e.code === 'KeyM' && !e.repeat) { muteToggle = true; return; }
    if (ARROWS.indexOf(e.code) >= 0) held.add(e.code);
    // One flap per press: key auto-repeat is ignored.
    if ((e.code === 'Space' || e.code === 'ArrowUp') && !e.repeat) flap = true;
  }

  function onKeyUp(e) { held.delete(e.code); }

  function onPointerDown(e) {
    e.preventDefault();
    const p = FK.Viewport.toLogical(e.clientX, e.clientY);
    if (FK.UI.hitMute(p.x, p.y)) { muteToggle = true; return; }   // never a flap
    flap = true;
    pointerHeld = true;
    pointerId = e.pointerId;
    target = p;
    try { e.target.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  }

  function onPointerMove(e) {
    if (!pointerHeld || e.pointerId !== pointerId) return;
    target = FK.Viewport.toLogical(e.clientX, e.clientY);
  }

  function onPointerUp(e) {
    if (e.pointerId !== pointerId) return;
    pointerHeld = false;
    pointerId = null;
    target = null;
  }

  FK.Input = {
    init(canvas) {
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);
      canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    },

    consumeFlap() { const v = flap; flap = false; return v; },
    consumeMuteToggle() { const v = muteToggle; muteToggle = false; return v; },

    /** Arrow-key direction. Opposite keys cancel; diagonals are normalized. */
    moveVector() {
      let x = (held.has('ArrowRight') ? 1 : 0) - (held.has('ArrowLeft') ? 1 : 0);
      let y = (held.has('ArrowDown') ? 1 : 0) - (held.has('ArrowUp') ? 1 : 0);
      if (x !== 0 && y !== 0) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
      return { x, y };
    },

    /** Logical point currently pressed (touch or mouse), or null. */
    pointerTarget() { return pointerHeld ? target : null; },

    /** Drop everything that is held (called when focus is lost). */
    clear() {
      held.clear();
      flap = false;
      pointerHeld = false;
      pointerId = null;
      target = null;
    },
  };
})(window.FK = window.FK || {});
