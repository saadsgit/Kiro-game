/* Sound effects. Every call is safe: blocked or missing audio never raises an error. */
(function (FK) {
  'use strict';

  let muted = false;
  const jump = makeClip('assets/jump.wav');
  const over = makeClip('assets/game_over.wav');

  function makeClip(src) {
    try {
      const a = new Audio(src);
      a.preload = 'auto';
      return a;
    } catch (_) {
      return null;
    }
  }

  function play(clip) {
    if (muted || !clip) return;
    try {
      clip.currentTime = 0;
      const p = clip.play();
      if (p && p.catch) p.catch(() => {});
    } catch (_) { /* ignore */ }
  }

  function stop(clip) {
    if (!clip) return;
    try { clip.pause(); clip.currentTime = 0; } catch (_) { /* ignore */ }
  }

  FK.Sound = {
    playJump() { play(jump); },
    playGameOver() { play(over); },
    setMuted(b) {
      muted = !!b;
      if (muted) { stop(jump); stop(over); }
    },
    isMuted() { return muted; },
  };
})(window.FK = window.FK || {});
