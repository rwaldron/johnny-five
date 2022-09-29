const EventEmitter = require("events");
const wm = new WeakMap();

class Emitter extends EventEmitter {
  pause() {
    wm.set(this, {
      ...this._events
    });

    this._events = { __proto__: null };
  }
  resume() {
    const events = wm.get(this);
    if (events) {
      this._events = {
        __proto__: null,
        ...events
      };
      wm.set(this, null);
    }
  }
}

Object.assign(
  Emitter.prototype,
  EventEmitter.prototype
);

module.exports = Emitter;
