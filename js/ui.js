/* Status bar, mute button and the start / game over / paused screens. */
(function (FK) {
  'use strict';

  const C = FK.C, U = FK.U;
  const FONT = '"Courier New", monospace';
  const MUTE = { x: 1212, y: C.FIELD_H + 6, w: 48, h: 48 };

  function band(ctx, h) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, C.FIELD_H / 2 - h / 2, C.W, h);
  }

  function text(ctx, str, x, y, size, bold) {
    ctx.font = (bold ? 'bold ' : '') + size + 'px ' + FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(str, x, y);
  }

  function drawSpeaker(ctx, muted) {
    const cx = MUTE.x + MUTE.w / 2, cy = MUTE.y + MUTE.h / 2;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();                                   // speaker body
    ctx.moveTo(cx - 14, cy - 5);
    ctx.lineTo(cx - 8, cy - 5);
    ctx.lineTo(cx, cy - 12);
    ctx.lineTo(cx, cy + 12);
    ctx.lineTo(cx - 8, cy + 5);
    ctx.lineTo(cx - 14, cy + 5);
    ctx.closePath();
    ctx.fill();
    if (muted) {
      ctx.beginPath();                                 // cross
      ctx.moveTo(cx + 6, cy - 7); ctx.lineTo(cx + 16, cy + 7);
      ctx.moveTo(cx + 16, cy - 7); ctx.lineTo(cx + 6, cy + 7);
      ctx.stroke();
    } else {
      ctx.beginPath();                                 // sound waves
      ctx.arc(cx + 2, cy, 8, -0.9, 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 2, cy, 15, -0.9, 0.9);
      ctx.stroke();
    }
    ctx.restore();
  }

  FK.UI = {
    muteRect: MUTE,

    hitMute(x, y) {
      return x >= MUTE.x - 4 && x <= MUTE.x + MUTE.w + 4 && y >= MUTE.y - 4 && y <= MUTE.y + MUTE.h + 4;
    },

    drawStatusBar(ctx, score, high, muted) {
      ctx.fillStyle = '#26364d';
      ctx.fillRect(0, C.FIELD_H, C.W, C.BAR_H);
      text(ctx, 'Score: ' + score + ' | High: ' + high, C.W / 2, C.FIELD_H + C.BAR_H / 2, 26, true);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      U.roundRectPath(ctx, MUTE.x, MUTE.y, MUTE.w, MUTE.h, 10);
      ctx.fill();
      drawSpeaker(ctx, muted);
    },

    drawStart(ctx) {
      band(ctx, 170);
      text(ctx, 'FLAPPY KIRO', C.W / 2, C.FIELD_H / 2 - 30, 64, true);
      text(ctx, 'Press Space or tap to start', C.W / 2, C.FIELD_H / 2 + 36, 26, false);
    },

    /** `cy` is the vertical center of the panel; the room ending moves it up to keep the bubble visible. */
    drawGameOver(ctx, score, high, newHigh, cy) {
      cy = cy == null ? C.FIELD_H / 2 : cy;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, cy - 115, C.W, 230);
      text(ctx, 'GAME OVER', C.W / 2, cy - 66, 60, true);
      text(ctx, 'Score: ' + score + '   High: ' + high, C.W / 2, cy, 28, false);
      if (newHigh) text(ctx, 'New High Score!', C.W / 2, cy + 38, 26, true);
      text(ctx, 'Press Space or tap to retry', C.W / 2, cy + 78, 24, false);
    },

    drawPaused(ctx) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, C.W, C.FIELD_H);
      text(ctx, 'PAUSED', C.W / 2, C.FIELD_H / 2 - 20, 60, true);
      text(ctx, 'Press Space or tap to resume', C.W / 2, C.FIELD_H / 2 + 40, 26, false);
    },
  };
})(window.FK = window.FK || {});
