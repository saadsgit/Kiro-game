/* Sky scene: the flying ghost, pipes, collisions, scoring, and the door shown after victory. */
(function (FK) {
  'use strict';

  const C = FK.C, U = FK.U;
  const GHOST = 'ghosty.png';
  const CAP_W = C.PIPE_BODY_W + C.CAP_EXTRA;          // 92: widest part of a pipe
  const GAP_MIN_Y = C.GAP_MARGIN + C.GAP_H / 2;       // 180
  const GAP_MAX_Y = C.FIELD_H - C.GAP_MARGIN - C.GAP_H / 2;   // 480

  /** Next gap center: inside the playfield margins and reachable from the previous one. */
  function nextGapY(prev) {
    if (prev == null) return U.rand(GAP_MIN_Y, GAP_MAX_Y);
    const lo = Math.max(GAP_MIN_Y, prev - C.GAP_STEP_MAX);
    const hi = Math.min(GAP_MAX_Y, prev + C.GAP_STEP_MAX);
    return U.rand(lo, hi);
  }

  /** The four solid rectangles of a pipe pair: top body, top cap, bottom cap, bottom body. */
  function pipeRects(p) {
    const capL = p.x, capR = p.x + CAP_W;
    const bodyL = p.x + C.CAP_EXTRA / 2, bodyR = bodyL + C.PIPE_BODY_W;
    const gapTop = p.gapY - C.GAP_H / 2, gapBottom = p.gapY + C.GAP_H / 2;
    return [
      { l: bodyL, t: 0, r: bodyR, b: gapTop - C.CAP_H },
      { l: capL, t: gapTop - C.CAP_H, r: capR, b: gapTop },
      { l: capL, t: gapBottom, r: capR, b: gapBottom + C.CAP_H },
      { l: bodyL, t: gapBottom + C.CAP_H, r: bodyR, b: C.FIELD_H },
    ];
  }

  function doorRect(door) {
    const top = C.FIELD_H / 2 - C.DOOR_H / 2;
    return { l: door.x, t: top, r: door.x + C.DOOR_W, b: top + C.DOOR_H };
  }

  function ghostBounds(g) { return U.spriteBounds(GHOST, g.x, g.y, C.GHOST_H); }
  function ghostHitbox(g) { return U.inset(ghostBounds(g), C.HITBOX_INSET); }

  function startVictory(sky) {
    sky.victory = true;
    sky.pipes = sky.pipes.filter((p) => p.x < C.W);          // pipes not yet on screen disappear
    let lastTrailing = 0;
    for (const p of sky.pipes) lastTrailing = Math.max(lastTrailing, p.x + CAP_W);
    sky.door = { x: Math.max(C.W, lastTrailing + C.DOOR_SPACING) };
  }

  const Sky = {
    nextGapY, pipeRects, doorRect, ghostBounds, ghostHitbox,

    create(withPipes) {
      const sky = {
        ghost: { x: C.GHOST_X, y: C.FIELD_H / 2, vy: 0 },
        pipes: [],
        door: null,
        score: 0,
        victory: false,
      };
      if (withPipes) sky.pipes.push({ x: C.FIRST_PIPE_X, gapY: nextGapY(null), scored: false });
      return sky;
    },

    flap(sky) { sky.ghost.vy = -C.FLAP_V; },

    /** Advance one step. Returns 'ok', 'crash' or 'door'. */
    update(sky, dt) {
      const g = sky.ghost;

      // Exact integration of constant acceleration over dt, then clamp the fall speed.
      g.y += g.vy * dt + 0.5 * C.GRAVITY * dt * dt;
      g.vy = Math.min(g.vy + C.GRAVITY * dt, C.MAX_FALL);

      // Pipes
      for (const p of sky.pipes) p.x -= C.PIPE_SPEED * dt;
      while (sky.pipes.length && sky.pipes[0].x + CAP_W < 0) sky.pipes.shift();
      if (!sky.victory && sky.pipes.length) {
        let last = sky.pipes[sky.pipes.length - 1];
        while (last.x < C.W) {
          last = { x: last.x + C.PIPE_SPACING, gapY: nextGapY(last.gapY), scored: false };
          sky.pipes.push(last);
        }
      }

      // The door scrolls toward the ghost (which keeps a fixed x). If it passes by untouched,
      // a new door appears at the right edge, so the player can always reach one.
      if (sky.door) {
        sky.door.x -= C.PIPE_SPEED * dt;
        if (sky.door.x + C.DOOR_W < 0) sky.door.x = C.W;
      }

      // Scoring: once the ghost's rear edge has cleared a pipe's trailing edge
      const bounds = ghostBounds(g);
      for (const p of sky.pipes) {
        if (!p.scored && !sky.victory && bounds.l > p.x + CAP_W) {
          p.scored = true;
          sky.score += 1;
          if (sky.score >= C.VICTORY_SCORE) startVictory(sky);
        }
      }

      // Collisions use the Hitbox, never the full sprite
      const hit = U.inset(bounds, C.HITBOX_INSET);
      if (hit.t <= 0 || hit.b >= C.FIELD_H) return 'crash';
      for (const p of sky.pipes) {
        for (const r of pipeRects(p)) if (U.overlap(hit, r)) return 'crash';
      }
      if (sky.door && U.overlap(hit, doorRect(sky.door))) return 'door';
      return 'ok';
    },

    /** Draw pipes, door and ghost (the sky color and clouds are drawn by game.js). */
    draw(ctx, sky) {
      for (const p of sky.pipes) drawPipe(ctx, p);
      if (sky.door) drawDoor(ctx, sky.door);
      drawGhost(ctx, sky.ghost);
    },
  };

  function drawPipe(ctx, p) {
    const [topBody, topCap, botCap, botBody] = pipeRects(p);
    ctx.fillStyle = '#2e9e2e';
    ctx.fillRect(topBody.l, topBody.t, topBody.r - topBody.l, topBody.b - topBody.t);
    ctx.fillRect(botBody.l, botBody.t, botBody.r - botBody.l, botBody.b - botBody.t);
    ctx.fillStyle = 'rgba(0,0,0,0.14)';                      // shaded right side
    ctx.fillRect(topBody.r - 12, topBody.t, 12, topBody.b - topBody.t);
    ctx.fillRect(botBody.r - 12, botBody.t, 12, botBody.b - botBody.t);
    ctx.fillStyle = '#1b7a1b';
    ctx.strokeStyle = '#115511';
    ctx.lineWidth = 2;
    for (const c of [topCap, botCap]) {
      ctx.fillRect(c.l, c.t, c.r - c.l, c.b - c.t);
      ctx.strokeRect(c.l + 1, c.t + 1, c.r - c.l - 2, c.b - c.t - 2);
    }
  }

  function drawDoor(ctx, door) {
    const r = doorRect(door);
    const img = FK.Assets.image('door.png');
    if (img) {
      U.drawFitted(ctx, img, 'door.png', r);
      return;
    }
    // Fallback: brown door with a white frame
    const w = r.r - r.l, h = r.b - r.t;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(r.l, r.t, w, h);
    ctx.fillStyle = '#b87333';
    ctx.fillRect(r.l + 10, r.t + 8, w - 20, h - 8);
    ctx.strokeStyle = '#7a4a1e';
    ctx.lineWidth = 2;
    ctx.strokeRect(r.l + 24, r.t + 24, w - 48, h * 0.25);
    ctx.strokeRect(r.l + 24, r.t + 24 + h * 0.3, w - 48, h * 0.5);
    ctx.fillStyle = '#c8c8c8';
    ctx.beginPath(); ctx.arc(r.r - 30, r.t + h * 0.55, 6, 0, Math.PI * 2); ctx.fill();
  }

  function drawGhost(ctx, g) {
    const sz = U.spriteSize(GHOST, C.GHOST_H);
    const tilt = g.vy < 0
      ? -C.MAX_TILT_DEG * Math.min(1, -g.vy / C.FLAP_V)
      : C.MAX_TILT_DEG * Math.min(1, g.vy / C.MAX_FALL);
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate((tilt * Math.PI) / 180);
    const img = FK.Assets.image(GHOST);
    if (img) {
      ctx.drawImage(img, -sz.w / 2, -sz.h / 2, sz.w, sz.h);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#2b3550';
      ctx.lineWidth = 2;
      U.roundRectPath(ctx, -sz.w / 2, -sz.h / 2, sz.w, sz.h, sz.w * 0.4);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  FK.Sky = Sky;
  if (typeof module !== 'undefined') module.exports = Sky;
})(window.FK = window.FK || {});
