const Options = require("./board.options");

const MODES = {
  INPUT: 0x00,
  OUTPUT: 0x01,
  ANALOG: 0x02,
  PWM: 0x03,
  SERVO: 0x04
};


/**
 * Pin Capability Signature Mapping
 */

const pinsToType = {
  20: "UNO",
  25: "LEONARDO",
  70: "MEGA"
};

function Pins(board) {
  if (!(this instanceof Pins)) {
    return new Pins(board);
  }

  const io = board.io;
  const pins = io.pins.slice();
  const length = pins.length;
  const type = pinsToType[length] || "OTHER";

  board.type = type;

  // Copy pin data to index
  for (let i = 0; i < length; i++) {
    this[i] = pins[i];
  }

  Object.defineProperties(this, {
    type: {
      value: type
    },
    length: {
      value: length
    }
  });

  // If an IO Plugin or Expander defines
  // these, override the default
  [
    "isInput",
    "isOutput",
    "isAnalog",
    "isPwm",
    "isServo",
  ].forEach(isType => {
    if (io[isType]) {
      this[isType] = io[isType];
    }
  });
}

Object.entries(MODES).forEach(([mode, value]) => {
  Object.defineProperty(Pins, mode, { value });
});

function isFirmata({io}) {
  return io.name === "Firmata" || io.name === "Mock";
}

function hasPins({pin, pins}) {
  return typeof pin !== "undefined" ||
    (typeof pins !== "undefined" && pins.length);
}

Pins.isFirmata = isFirmata;

Pins.Error = ({pin, type, via}) => {
  throw new Error(
    `Pin Error: ${pin} is not a valid ${type} pin (${via})`
  );
};

const normalizers = new Map();

Pins.normalize = function(options, board) {
  var type = board.pins.type;
  var isArduino = isFirmata(board);
  var normalizer = normalizers.get(board);
  var isNormalizing;

  if (typeof options === "string" ||
    typeof options === "number" ||
    Array.isArray(options)) {

    options = new Options(options);
  }

  if (!normalizer) {
    isNormalizing = board.io && typeof board.io.normalize === "function";

    normalizer = function(pin) {
      return isArduino ?
        Pins.fromAnalog(Pins.translate(pin, type)) :
        (isNormalizing ? board.io.normalize(pin) : pin);
    };

    normalizers.set(board, normalizer);
  }

  // Auto-normalize pin values, this reduces boilerplate code
  // inside module constructors
  if (hasPins(options)) {

    // When an array of pins is present, attempt to
    // normalize them if necessary
    if (options.pins) {
      options.pins = options.pins.map(normalizer);
    } else {
      options.pin = normalizer(options.pin);
    }
  }

  return options;
};

Pins.normalize.clear = function() {
  normalizers.clear();
};

// Special kit-centric pin translations
Pins.translations = {
  UNO: {
    dtoa: {
      14: "A0",
      15: "A1",
      16: "A2",
      17: "A3",
      18: "A4",
      19: "A5"
    },

    // TinkerKit
    tinker: {
      I0: "A0",
      I1: "A1",
      I2: "A2",
      I3: "A3",
      I4: "A4",
      I5: "A5",

      O0: 11,
      O1: 10,
      O2: 9,
      O3: 6,
      O4: 5,
      O5: 3,

      D13: 13,
      D12: 12,
      D8: 8,
      D7: 7,
      D4: 4,
      D2: 2
    }
  },
  MEGA: {
    dtoa: {
      54: "A0",
      55: "A1",
      56: "A2",
      57: "A3",
      58: "A4",
      59: "A5",
      60: "A6",
      61: "A7",
      62: "A8",
      63: "A9"
    },

    // TinkerKit
    tinker: {
      I0: "A0",
      I1: "A1",
      I2: "A2",
      I3: "A3",
      I4: "A4",
      I5: "A5",
      I6: "A6",
      I7: "A7",
      I8: "A8",
      I9: "A9",

      O0: 11,
      O1: 10,
      O2: 9,
      O3: 6,
      O4: 5,
      O5: 3,

      D13: 13,
      D12: 12,
      D8: 8,
      D7: 7,
      D4: 4,
      D2: 2
    }
  }
};

Pins.translations.LEONARDO = Pins.translations.UNO;

Pins.translate = function(pin, type) {
  var translations = Pins.translations[type.toUpperCase()];

  if (!translations) {
    return pin;
  }

  return Object.keys(translations).reduce(function(pin, map) {
    return translations[map][pin] || pin;
  }, pin);
};

Pins.fromAnalog = function(pin) {
  if (typeof pin === "string" && (pin.length > 1 && pin[0] === "A")) {
    return parseInt(pin.slice(1), 10);
  }
  return pin;
};

Pins.identity = function(pins, needle) {
  return [].findIndex.call(pins, function(pin) {
    return pin.name === needle || pin.id === needle || pin.port === needle;
  });
};

/**
 * (generated methods)
 *
 * Pins.prototype.isInput
 * Pins.prototype.isOutput
 * Pins.prototype.isAnalog
 * Pins.prototype.isPwm
 * Pins.prototype.isServo
 *
 */
Object.keys(MODES).forEach(function(key) {
  var name = key[0] + key.slice(1).toLowerCase();

  Pins.prototype["is" + name] = function(pin) {
    var attrs = this[pin] || this[Pins.identity(this, pin)];

    if (attrs && attrs.supportedModes.includes(MODES[key])) {
      return true;
    }
    return false;
  };
});

Pins.prototype.isDigital = function(pin) {
  var attrs = this[pin] || this[Pins.identity(this, pin)];

  if (attrs && attrs.supportedModes.length) {
    return true;
  }
  return false;
};

module.exports = Pins;
