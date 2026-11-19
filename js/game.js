/* Game: state machine and main loop.
 *   modes:  start -> playing <-> paused -> gameover -> playing ...
 *   stages (inside "playing"): sky -> transition -> room
 */
(function (FK) {
  'use strict';

  const C = FK.C, U = FK.U;

  const canvas = document.getElementById('game');
  const ctx = FK.Viewport.init(canvas);
  FK.Input.init(canvas);

  const game = {
    mode: 'start',
    stage: 'sky',
    sky: FK.Sky.create(false),
    room: null,
    transition: null,
    clouds: FK.Clouds.create(),
    score: 0,
    high: FK.Storage.loadHigh(),
    newHigh: false,
    muted: FK.Storage.loadMuted(),
    gameOverAt: 0,
    clock: 0,                    // drives the start-screen hover
  };
  FK.Sound.setMuted(game.muted);

  // ---- Round control -------------------------------------------------------

  function startRound() {
    game.sky = FK.Sky.create(true);
    game.room = null;
    game.transition = null;
    game.score = 0;
    game.newHigh = false;
    game.stage = 'sky';
    game.mode = 'playing';
    FK.Sky.flap(game.sky);                 // the press that starts (or restarts) the round is a flap
    FK.Sound.playJump();
  }

  function endRound(crashed) {
    game.mode = 'gameover';
    game.gameOverAt = performance.now();
    if (crashed) FK.Sound.playGameOver();
  }

  function pause() {
    if (game.mode !== 'playing') return;
    game.mode = 'paused';
    FK.Input.clear();
  }

  function toggleMute() {
    game.muted = !game.muted;
    FK.Sound.setMuted(game.muted);
    FK.Storage.saveMuted(game.muted);
  }

  /** Keep Score and High_Score in step with the sky; the high score updates live. */
  function syncScore() {
    if (game.sky.score === game.score) return;
    game.score = game.sky.score;
    if (game.score > game.high) {
      game.high = game.score;
      game.newHigh = true;
      FK.Storage.saveHigh(game.high);
    }
  }

  // ---- Update --------------------------------------------------------------

  function updatePlaying(dt, flap) {
    if (game.stage === 'sky') {
      if (flap) { FK.Sky.flap(game.sky); FK.Sound.playJump(); }
      const result = FK.Sky.update(game.sky, dt);
      syncScore();
      if (result === 'crash') endRound(true);
      else if (result === 'door') {
        game.stage = 'transition';
        game.transition = FK.Transition.create();
      }
      return;
    }

    // Flaps are ignored during the transition and in the room.
    if (game.stage === 'transition') {
      const r = FK.Transition.update(game.transition, dt);
      if (r.switchNow) {
        game.room = FK.Room.create();           // swapped in while the screen is fully black
      }
      if (game.room) FK.Room.update(game.room, dt, FK.Input);
      if (r.done) {
        game.stage = 'room';
        game.room.controllable = true;
      }
      return;
    }

    if (game.stage === 'room') {
      if (FK.Room.update(game.room, dt, FK.Input) === 'done') endRound(false);
    }
  }

  function update(dt) {
    const flap = FK.Input.consumeFlap();
    if (FK.Input.consumeMuteToggle()) toggleMute();
    FK.Clouds.update(game.clouds, dt);                    // clouds drift on every screen

    switch (game.mode) {
      case 'start':
        game.clock += dt;
        if (flap) startRound();
        break;
      case 'playing':
        updatePlaying(dt, flap);
        break;
      case 'paused':
        if (flap) game.mode = 'playing';                  // resume; the press is not a flap
        break;
      case 'gameover':
        if (flap && performance.now() - game.gameOverAt >= C.GAMEOVER_LOCK * 1000) startRound();
        break;
    }
  }

  // ---- Draw ----------------------------------------------------------------

  function drawSky() {
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, C.W, C.FIELD_H);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';           // faint sketchy texture
    ctx.lineWidth = 1;
    for (let x = 30; x < C.W; x += 53) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 9, C.FIELD_H);
      ctx.stroke();
    }
    FK.Clouds.draw(ctx, game.clouds);
  }

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, C.W, C.H);

    const inRoom = game.room && (game.stage === 'room' || game.stage === 'transition');
    if (game.mode === 'start') {
      drawSky();
      const g = game.sky.ghost;
      g.y = C.FIELD_H / 2 + Math.sin((2 * Math.PI * game.clock) / C.START_HOVER_PERIOD) * C.START_HOVER_AMP;
      FK.UI.drawStart(ctx);                               // title band first, so the ghost is not dimmed by it
      FK.Sky.draw(ctx, game.sky);
    } else if (inRoom) {
      FK.Room.draw(ctx, game.room);                       // no clouds in the room
    } else {
      drawSky();
      FK.Sky.draw(ctx, game.sky);
    }

    if (game.stage === 'transition' && game.transition) FK.Transition.draw(ctx, game.transition);

    FK.UI.drawStatusBar(ctx, game.score, game.high, game.muted);

    if (game.mode === 'paused') FK.UI.drawPaused(ctx);
    else if (game.mode === 'gameover') FK.UI.drawGameOver(ctx, game.score, game.high, game.newHigh,
      game.stage === 'room' ? 130 : null);   // after the room, keep the speech bubble clear
  }

  // ---- Loop ----------------------------------------------------------------

  let last = null;

  function frame(now) {
    if (last === null) last = now;
    const dt = Math.min((now - last) / 1000, 1 / 30);     // never jump after a slow frame
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
    last = null;                                          // fresh time base after returning
  });
  window.addEventListener('blur', () => { pause(); FK.Input.clear(); });

  FK.game = game;                                         // exposed for debugging
  requestAnimationFrame(frame);
})(window.FK = window.FK || {});
