/* Room layout, in pixels of the cropped assets/room.png (718 x 483).
 * Measured on the image with a 50 px grid. Items not listed here (the rug, the cat,
 * wall decorations) are walkable or out of reach. If room.png is ever replaced,
 * these numbers must be re-measured. */
(function (FK) {
  'use strict';

  FK.RoomData = Object.freeze({
    imageSize: { w: 718, h: 483 },

    // Walkable floor: everything below the baseboard, inside the left wall.
    floor: { x: 18, y: 160, w: 700, h: 323 },

    // Solid furniture the ghost cannot walk through.
    solids: [
      { name: 'bookshelf',           x: 19,  y: 88,  w: 94,  h: 120 },
      { name: 'dresser',             x: 122, y: 130, w: 87,  h: 80 },
      { name: 'left bedside table',  x: 240, y: 140, w: 49,  h: 65 },
      { name: 'bed',                 x: 291, y: 120, w: 138, h: 189 },
      { name: 'right bedside table', x: 432, y: 140, w: 48,  h: 65 },
      { name: 'desk',                x: 2,   y: 326, w: 56,  h: 150 },
      { name: 'desk chair',          x: 69,  y: 363, w: 42,  h: 81 },
      { name: 'round coffee table',  x: 572, y: 361, w: 59,  h: 60 },
      { name: 'armchair',            x: 611, y: 264, w: 98,  h: 115 },
    ],

    // Centers of the resting ghosts. The player starts in the right third of the room.
    start:  { x: 570, y: 215 },
    friend: { x: 360, y: 350 },
  });
})(window.FK = window.FK || {});
