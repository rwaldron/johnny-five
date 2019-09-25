const LedControl = require("./ledcontrol");

class Digits extends LedControl {
  constructor(options) {
    options.isMatrix = false;
    super(options);
  }

  static get CHARS() {
    return LedControl.DIGIT_CHARS;
  }
}

module.exports = Digits;
