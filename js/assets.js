/* Image loading. Never blocks start-up: image() returns null until loaded or if it failed. */
(function (FK) {
  'use strict';

  const NAMES = [
    'ghosty.png', 'ghost-front.png', 'ghost-back.png', 'ghost-left.png', 'ghost-right.png',
    'door.png', 'room.png', 'shadow.png',
  ];

  const images = {};
  NAMES.forEach((n) => {
    const im = new Image();
    im.src = 'assets/' + n;
    images[n] = im;
  });

  const tintCache = {};

  FK.Assets = {
    image(name) {
      const im = images[name];
      return im && im.complete && im.naturalWidth > 0 ? im : null;
    },

    /** Cached copy of an image with a color laid over its opaque pixels. */
    tinted(name, color) {
      const key = name + '|' + color;
      if (tintCache[key]) return tintCache[key];
      const im = this.image(name);
      if (!im) return null;
      const c = document.createElement('canvas');
      c.width = im.naturalWidth;
      c.height = im.naturalHeight;
      const g = c.getContext('2d');
      g.drawImage(im, 0, 0);
      g.globalCompositeOperation = 'source-atop';
      g.fillStyle = color;
      g.fillRect(0, 0, c.width, c.height);
      tintCache[key] = c;
      return c;
    },
  };
})(window.FK = window.FK || {});
