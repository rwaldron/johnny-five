var Collection = require("./mixins/collection");
var Board = require("./board");
var events = require("events");
var util = require("util");
var priv = new Map();


function analogInitializer(opts, dataHandler) {
  var state = priv.get(this);

  this.io.pinMode(opts.pin, this.io.MODES.ANALOG);

  setTimeout(function() {
    state.isCalibrated = true;
    this.emit("calibrated");
  }.bind(this), 10);

  this.io.analogRead(opts.pin, dataHandler);
}
var Controllers = {
  PIR: {
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);
        var calibrationDelay = typeof opts.calibrationDelay !== "undefined" ?
          opts.calibrationDelay : 2000;

        this.io.pinMode(opts.pin, this.io.MODES.INPUT);

        setTimeout(function() {
          state.isCalibrated = true;
          this.emit("calibrated");
        }.bind(this), calibrationDelay);

        this.io.digitalRead(opts.pin, dataHandler);
      }
    },
    toBoolean: {
      value: function(raw) {
        return !!raw;
      }
    }
  },
  GP2Y0D805Z0F: {
    initialize: {
      value: function(opts, dataHandler) {
        var address = opts.address || 0x26;
        var state = priv.get(this);

        opts.address = address;

        // This is meaningless for GP2Y0D805Z0F.
        // The event is implemented for consistency
        // with the digital passive infrared sensor
        setTimeout(function() {
          state.isCalibrated = true;
          this.emit("calibrated");
        }.bind(this), 10);


        // Set up I2C data connection
        this.io.i2cConfig(opts);

        this.io.i2cWriteReg(address, 0x03, 0xFE);
        this.io.i2cWrite(address, [0x00]);
        this.io.i2cRead(address, 1, function(data) {
          dataHandler(data[0] & 0x02);
        });
      }
    },
    toBoolean: {
      value: function(raw) {
        return raw === 0;
      }
    }
  },
  GP2Y0D810Z0F: {
    initialize: {
      value: analogInitializer
    },
    toBoolean: {
      value: function(raw) {
        return raw >> 9 === 0;
      }
    }
  },
  GP2Y0A60SZLF: {
    initialize: {
      value: analogInitializer
    },
    toBoolean: {
      value: function(raw) {
        return raw >> 9 === 1;
      }
    }
  }
};

Controllers.GP2Y0D815Z0F = Controllers.GP2Y0D810Z0F;

Controllers["HC-SR501"] = Controllers.PIR;
Controllers["HCSR501"] = Controllers.PIR;
Controllers["0D805"] = Controllers.GP2Y0D805Z0F;
Controllers["805"] = Controllers.GP2Y0D805Z0F;
Controllers["0D810"] = Controllers.GP2Y0D810Z0F;
Controllers["810"] = Controllers.GP2Y0D810Z0F;
Controllers["0D815"] = Controllers.GP2Y0D815Z0F;
Controllers["815"] = Controllers.GP2Y0D815Z0F;
Controllers["0A60SZLF"] = Controllers.GP2Y0A60SZLF;
Controllers["60SZLF"] = Controllers.GP2Y0A60SZLF;

/**
 * Motion
 * @constructor
 *
 * five.Motion(7);
 *
 * five.Motion({
 *  controller: "PIR",
 *  pin: 7,
 *  freq: 100,
 *  calibrationDelay: 1000
 * });
 *
 *
 * @param {Object} opts [description]
 *
 */

function Motion(opts) {

  if (!(this instanceof Motion)) {
    return new Motion(opts);
  }

  var freq = opts.freq || 25;
  var last = false;
  var controller;
  var state;

  Board.Device.call(
    this, opts = Board.Options(opts)
  );

  if (typeof opts.controller === "string") {
    controller = Controllers[opts.controller];
  } else {
    controller = opts.controller || Controllers["PIR"];
  }

  Board.Controller.call(this, controller, opts);

  state = {
    value: false,
    isCalibrated: false
  };

  priv.set(this, state);

  Object.defineProperties(this, {
    /**
     * [read-only] Current sensor state
     * @property detectedMotion
     * @type Boolean
     */
    detectedMotion: {
      get: function() {
        return this.toBoolean(state.value);
      }
    },
    /**
     * [read-only] Sensor calibration status
     * @property isCalibrated
     * @type Boolean
     */
    isCalibrated: {
      get: function() {
        return state.isCalibrated;
      }
    },
  });

  if (typeof this.initialize === "function") {
    this.initialize(opts, function(data) {
      state.value = data;
    });
  }

  setInterval(function() {
    var isChange = false;
    var eventData = {
      timestamp: Date.now(),
      detectedMotion: this.detectedMotion,
      isCalibrated: state.isCalibrated
    };

    if (state.isCalibrated && this.detectedMotion && !last) {
      this.emit("motionstart", eventData);
    }

    if (state.isCalibrated && !this.detectedMotion && last) {
      this.emit("motionend", eventData);
    }

    if (last !== this.detectedMotion) {
      isChange = true;
    }

    this.emit("data", eventData);

    if (isChange) {
      this.emit("change", eventData);
    }

    last = this.detectedMotion;
  }.bind(this), freq);
}

util.inherits(Motion, events.EventEmitter);



/**
 * Motion.Collection()
 * new Motion.Collection()
 *
 * Constructs an Array-like instance
 */

Motion.Collection = function(numsOrObjects) {
  if (!(this instanceof Motion.Collection)) {
    return new Motion.Collection(numsOrObjects);
  }

  Object.defineProperty(this, "type", {
    value: Motion
  });

  Collection.Emitter.call(this, numsOrObjects);
};

Motion.Collection.prototype = Object.create(Collection.Emitter.prototype, {
  constructor: {
    value: Motion.Collection
  }
});

Collection.installMethodForwarding(
  Motion.Collection.prototype, Motion.prototype
);


module.exports = Motion;
