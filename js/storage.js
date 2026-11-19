/* Safe localStorage wrapper. Never throws; falls back to memory for the session. */
(function (FK) {
  'use strict';

  const memory = {};

  function read(key) {
    try {
      const v = window.localStorage.getItem(key);
      if (v !== null) return v;
    } catch (_) { /* storage unavailable */ }
    return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null;
  }

  function write(key, value) {
    memory[key] = String(value);
    try { window.localStorage.setItem(key, String(value)); } catch (_) { /* keep in memory */ }
  }

  FK.Storage = {
    loadHigh() {
      const v = read(FK.C.KEY_HIGH);
      if (v === null || !/^\d+$/.test(v)) return 0;
      const n = Number(v);
      return Number.isSafeInteger(n) ? n : 0;
    },
    saveHigh(n) { write(FK.C.KEY_HIGH, n); },
    loadMuted() { return read(FK.C.KEY_MUTED) === '1'; },
    saveMuted(b) { write(FK.C.KEY_MUTED, b ? '1' : '0'); },
  };
})(window.FK = window.FK || {});
