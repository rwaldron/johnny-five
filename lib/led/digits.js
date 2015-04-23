var LedControl = require("./ledcontrol");

// stub implementation; extract functionality from ledcontrol.js
function Digits(opts) {
  opts.isMatrix = false;
  return new LedControl(opts);
}

Object.assign(Digits, LedControl, {
  CHARS: LedControl.DIGIT_CHARS
});

module.exports = Digits;
