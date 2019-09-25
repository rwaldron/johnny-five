const LedControl = require("./ledcontrol");

class Matrix extends LedControl {
  constructor(options) {
    options.isMatrix = true;
    super(options);
  }

  static get CHARS() {
    return LedControl.MATRIX_CHARS;
  }
}

module.exports = Matrix;
