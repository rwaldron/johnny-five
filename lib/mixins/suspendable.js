const Withinable = require("./withinable");
const wm = new WeakMap();

class Suspendable extends Withinable {
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

module.exports = Suspendable;
