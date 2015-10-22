var LedControl = require("./ledcontrol");

// stub implementation; extract functionality from ledcontrol.js
function Matrix(opts) {
  opts.isMatrix = true;
  return new LedControl(opts);
}

Object.assign(Matrix, LedControl, {
  CHARS: LedControl.MATRIX_CHARS
});

module.exports = Matrix;
