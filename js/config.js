/* Flappy Kiro: constants. All sizes are logical px on a 1280 x 720 canvas. */
(function (FK) {
  'use strict';

  FK.C = Object.freeze({
    W: 1280, H: 720, BAR_H: 60, FIELD_H: 660,

    // Sky ghost
    GHOST_X: 320, GHOST_H: 48,
    FLAP_V: 420, GRAVITY: 1500, MAX_FALL: 600, MAX_TILT_DEG: 25,
    START_HOVER_AMP: 8, START_HOVER_PERIOD: 1.2,

    // Pipes and door
    PIPE_SPEED: 240, PIPE_BODY_W: 80, CAP_EXTRA: 12, CAP_H: 30,
    PIPE_SPACING: 360, GAP_H: 240, GAP_MARGIN: 60, GAP_STEP_MAX: 200,
    FIRST_PIPE_X: 1480,
    VICTORY_SCORE: 5,
    DOOR_W: 185, DOOR_H: 330, DOOR_SPACING: 360,

    // Hitbox: Ghost_Bounds inset on every side by this fraction of its width / height
    HITBOX_INSET: 0.12,

    // Clouds
    CLOUD_COUNT: 6, CLOUD_SPEED_MIN: 20, CLOUD_SPEED_MAX: 100,
    CLOUD_ALPHA_MIN: 0.4, CLOUD_ALPHA_MAX: 0.8,

    // Screens and transition (seconds)
    GAMEOVER_LOCK: 0.5,
    FADE_OUT: 1.0, FADE_HOLD: 0.5, FADE_IN: 1.0,

    // Room
    ROOM_GHOST_H: 64, ROOM_SPEED: 220, TOUCH_STOP_DIST: 8,
    FRIEND_TRIGGER_DIST: 24, BUBBLE_TIME: 2.5,
    BOB_AMPLITUDE: 4, BOB_PERIOD: 1.6, BOB_EASE: 0.15,
    HOVER: 6,                                   // sprite floats this far above Ground_Position
    SHADOW_W: 44, SHADOW_H: 8, SHADOW_ALPHA: 0.35, SHADOW_Y: -4,
    FRIEND_TINT: 'rgba(110,170,255,0.45)',

    // Persistence keys
    KEY_HIGH: 'flappyKiro.high',
    KEY_MUTED: 'flappyKiro.muted',
  });

  // Opaque bounding box of each sprite as fractions of the image (measured with
  // tools/measure-bounds.py, because reading pixels at run time fails on file://).
  FK.SPRITE_BOUNDS = Object.freeze({
    'ghosty.png':      { l: 0.0000, t: 0.0000, r: 1.0000, b: 1.0000 },
    'ghost-front.png': { l: 0.1256, t: 0.0383, r: 0.8884, b: 0.9617 },
    'ghost-back.png':  { l: 0.1075, t: 0.0521, r: 0.8738, b: 0.9668 },
    'ghost-left.png':  { l: 0.1388, t: 0.0437, r: 0.9426, b: 0.9660 },
    'ghost-right.png': { l: 0.1171, t: 0.0580, r: 0.8739, b: 0.9758 },
    'door.png':        { l: 0.3683, t: 0.0840, r: 0.6287, b: 0.9268 },
    'shadow.png':      { l: 0.2993, t: 0.4560, r: 0.7007, b: 0.5463 },
  });

  // Natural sizes, used for aspect ratios before an image has loaded.
  FK.SPRITE_SIZE = Object.freeze({
    'ghosty.png':      { w: 1290, h: 1567 },
    'ghost-front.png': { w: 215, h: 209 },
    'ghost-back.png':  { w: 214, h: 211 },
    'ghost-left.png':  { w: 209, h: 206 },
    'ghost-right.png': { w: 222, h: 207 },
    'door.png':        { w: 676, h: 369 },
    'shadow.png':      { w: 578, h: 432 },
  });
})(window.FK = window.FK || {});
