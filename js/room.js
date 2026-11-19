/* Room scene: walk the ghost to the friend ghost. Includes idle animation, shadows and the speech bubble. */
(function (FK) {
  'use strict';

  const C = FK.C, U = FK.U, D = FK.RoomData;
  const FRONT = 'ghost-front.png';
  const BUBBLE_TEXT = 'Nice job!';

  // The Hitbox and Ground_Position are fixed from the front sprite, so collisions
  // do not change when the ghost turns. Offsets are relative to the sprite center.
  function restOffsets() {
    const b = U.spriteBounds(FRONT, 0, 0, C.ROOM_GHOST_H);
    const hit = U.inset(b, C.HITBOX_INSET);
    return { bounds: b, hit, groundY: b.b };
  }

  function hitboxOf(room, g) {
    const o = room.off.hit;
    return { l: g.x + o.l, t: g.y + o.t, r: g.x + o.r, b: g.y + o.b };
  }

  function makeGhost(x, y, friend) {
    return { x, y, facing: 'front', bob: 0, friend };
  }

  function blocked(room, hb, ignoreFriend) {
    const f = room.floor;
    if (hb.l < f.l || hb.r > f.r || hb.t < f.t || hb.b > f.b) return true;
    for (const s of room.solids) if (U.overlap(hb, s)) return true;
    if (!ignoreFriend && U.overlap(hb, hitboxOf(room, room.friend))) return true;
    return false;
  }

  /** Move along one axis; revert it if the new Hitbox would leave the floor or hit something. */
  function tryMove(room, g, dx, dy) {
    if (dx === 0 && dy === 0) return;
    g.x += dx; g.y += dy;
    if (blocked(room, hitboxOf(room, g), false)) { g.x -= dx; g.y -= dy; }
  }

  /** Direction of travel from the arrow keys, or from a held pointer. */
  function movement(room, input, dt) {
    const k = input.moveVector();
    if (k.x !== 0 || k.y !== 0) return k;
    const t = input.pointerTarget();
    if (!t) return { x: 0, y: 0 };
    const dx = t.x - room.player.x, dy = t.y - room.player.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= C.TOUCH_STOP_DIST) return { x: 0, y: 0 };
    const reach = Math.min(1, dist / (C.ROOM_SPEED * Math.max(dt, 1e-4)));   // do not overshoot the target
    return { x: (dx / dist) * reach, y: (dy / dist) * reach };
  }

  const Room = {
    create() {
      const iw = D.imageSize.w, ih = D.imageSize.h;
      const s = Math.min(C.W / iw, C.FIELD_H / ih);
      const rect = { x: (C.W - iw * s) / 2, y: (C.FIELD_H - ih * s) / 2, w: iw * s, h: ih * s };
      const toRect = (r) => ({
        l: rect.x + r.x * s, t: rect.y + r.y * s, r: rect.x + (r.x + r.w) * s, b: rect.y + (r.y + r.h) * s,
      });
      const room = {
        rect,
        scale: s,
        floor: toRect(D.floor),
        solids: D.solids.map(toRect),
        off: restOffsets(),
        player: makeGhost(rect.x + D.start.x * s, rect.y + D.start.y * s, false),
        friend: makeGhost(rect.x + D.friend.x * s, rect.y + D.friend.y * s, true),
        phase: 'walking',        // 'walking' | 'talking'
        talkT: 0,
        t: 0,                    // animation clock; only advances in update()
        controllable: false,
      };
      room.friend.facing = faceToward(room.friend, room.player);
      return room;
    },

    /** Returns 'ok', or 'done' once the bubble has been shown long enough. */
    update(room, dt, input) {
      room.t += dt;
      const p = room.player, f = room.friend;
      let moving = false;

      if (room.controllable && room.phase === 'walking') {
        const v = movement(room, input, dt);
        moving = v.x !== 0 || v.y !== 0;
        if (moving) {
          tryMove(room, p, v.x * C.ROOM_SPEED * dt, 0);        // x axis, then y axis, so we slide
          tryMove(room, p, 0, v.y * C.ROOM_SPEED * dt);
          if (v.x < 0) p.facing = 'left';
          else if (v.x > 0) p.facing = 'right';
          else if (v.y < 0) p.facing = 'back';
          else if (v.y > 0) p.facing = 'front';
        }
      }

      // Idle animation eases in and out so the sprite never jumps (the friend is always idle)
      const step = dt / C.BOB_EASE;
      p.bob = U.clamp(p.bob + (moving ? -step : step), 0, 1);
      f.bob = U.clamp(f.bob + step, 0, 1);

      f.facing = faceToward(f, p);

      if (room.controllable && room.phase === 'walking') {
        if (U.gap(hitboxOf(room, p), hitboxOf(room, f)) <= C.FRIEND_TRIGGER_DIST) {
          room.phase = 'talking';
          room.talkT = 0;
        }
      }
      if (room.phase === 'talking') {
        room.talkT += dt;
        if (room.talkT >= C.BUBBLE_TIME) return 'done';
      }
      return 'ok';
    },

    draw(ctx, room) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, C.W, C.FIELD_H);
      drawRoomImage(ctx, room);

      const list = [room.player, room.friend].sort((a, b) => a.y - b.y);
      for (const g of list) drawShadow(ctx, room, g);               // shadows under every ghost
      for (const g of list) drawGhost(ctx, room, g);                // lower ghost drawn in front
      if (room.phase === 'talking') drawBubble(ctx, room);
    },
  };

  function faceToward(from, to) {
    const dx = to.x - from.x, dy = to.y - from.y;
    if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 'left' : 'right';
    return dy < 0 ? 'back' : 'front';
  }

  function drawRoomImage(ctx, room) {
    const r = room.rect;
    const img = FK.Assets.image('room.png');
    if (img) { ctx.drawImage(img, r.x, r.y, r.w, r.h); return; }
    ctx.fillStyle = '#9db8d6';                                       // fallback: wall and floor
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = '#d9a35f';
    ctx.fillRect(room.floor.l, room.floor.t, room.floor.r - room.floor.l, room.floor.b - room.floor.t);
    ctx.fillStyle = '#7a5a3a';
    for (const s of room.solids) ctx.fillRect(s.l, s.t, s.r - s.l, s.b - s.t);
  }

  function groundY(room, g) { return g.y + room.off.groundY; }

  function drawShadow(ctx, room, g) {
    const cx = g.x, cy = groundY(room, g) + C.SHADOW_Y;               // never uses the bob offset
    const dest = { l: cx - C.SHADOW_W / 2, t: cy - C.SHADOW_H / 2, r: cx + C.SHADOW_W / 2, b: cy + C.SHADOW_H / 2 };
    ctx.save();
    ctx.globalAlpha = C.SHADOW_ALPHA;
    const img = FK.Assets.image('shadow.png');
    if (img) {
      U.drawFitted(ctx, img, 'shadow.png', dest);
    } else {
      ctx.fillStyle = '#1e1b3a';
      ctx.beginPath();
      ctx.ellipse(cx, cy, C.SHADOW_W / 2, C.SHADOW_H / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawGhost(ctx, room, g) {
    const bobY = -Math.sin((2 * Math.PI * room.t) / C.BOB_PERIOD) * C.BOB_AMPLITUDE * g.bob;
    const name = 'ghost-' + g.facing + '.png';
    let src = FK.Assets.image(name);
    let useName = name;
    if (!src) { src = FK.Assets.image('ghosty.png'); useName = 'ghosty.png'; }
    const sz = U.spriteSize(useName, C.ROOM_GHOST_H);
    const cx = g.x, cy = g.y - C.HOVER + bobY;
    if (!src) {
      ctx.fillStyle = g.friend ? '#bcd6ff' : '#ffffff';
      ctx.strokeStyle = '#2b3550';
      ctx.lineWidth = 2;
      U.roundRectPath(ctx, cx - sz.w / 2, cy - sz.h / 2, sz.w, sz.h, sz.w * 0.4);
      ctx.fill();
      ctx.stroke();
      return;
    }
    if (g.friend) src = FK.Assets.tinted(useName, C.FRIEND_TINT) || src;   // tinted copy keeps the two ghosts apart
    ctx.drawImage(src, cx - sz.w / 2, cy - sz.h / 2, sz.w, sz.h);
  }

  function drawBubble(ctx, room) {
    const f = room.friend;
    ctx.save();
    ctx.font = 'bold 28px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textW = ctx.measureText(BUBBLE_TEXT).width;
    const w = textW + 48, h = 56, tail = 12;
    // Anchored to the friend's resting position, so the bubble does not bob
    const headY = f.y + room.off.bounds.t - C.HOVER;
    let top = headY - 6 - tail - h;
    top = Math.max(6, top);
    const bottom = top + h;
    const left = U.clamp(f.x - w / 2, 8, C.W - 8 - w);
    const tipX = U.clamp(f.x, left + 18, left + w - 18);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1b2233';
    ctx.lineWidth = 3;
    U.roundRectPath(ctx, left, top, w, h, 14);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();                                   // tail pointing at the head
    ctx.moveTo(tipX - 10, bottom - 1);
    ctx.lineTo(tipX, bottom + tail);
    ctx.lineTo(tipX + 10, bottom - 1);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(tipX - 10, bottom);
    ctx.lineTo(tipX, bottom + tail);
    ctx.lineTo(tipX + 10, bottom);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(tipX - 8, bottom - 2, 16, 4);        // hide the outline where the tail joins the box

    ctx.fillStyle = '#1b2233';
    ctx.fillText(BUBBLE_TEXT, left + w / 2, top + h / 2 + 1);
    ctx.restore();
  }

  FK.Room = Room;
})(window.FK = window.FK || {});
