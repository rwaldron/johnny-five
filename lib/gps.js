var events = require("events");
var util = require("util");

var Board = require("./board");
var Fn = require("./fn");
var Pin = require("./pin");

var toFixed = Fn.toFixed;


var priv = new Map();

var Breakouts = {

  /*
   * https://www.adafruit.com/products/746
   */
  ADAFRUIT_ULTIMATE_GPS: {
    receiver: {
      value: "FGPMMOPA6H"
    }
  }

};

// GPS Antenna Modules
var Receivers = {

  /*
   * http://www.gtop-tech.com/en/product/LadyBird-1-PA6H/MT3339_GPS_Module_04.html
   */
  FGPMMOPA6H: {
    // Later, when we add logging that code will go here
    chip: {
      value: "MT3339"
    }
  }

};

// GPS chips
var Chips = {

  DEFAULT: {
    baud: {
      value: 9600,
      writable: true
    },
    configure: {
      value: function(callback) {
        process.nextTick(callback);
      }
    }
  },

  /*
   * http://www.mediatek.com/en/products/connectivity/gps/mt3339/
   */
  MT3339: {
    baud: {
      value: 9600,
      writable: true
    },
    configure: {
      value: function(callback) {
        process.nextTick(callback);
      }
    },
    frequency: {
      get: function() {
        var state = priv.get(this);
        return state.frequency;
      },
      set: function(frequency) {
        var state = priv.get(this);

        // Enforce maximum frequency of 10hz
        if (frequency < 10) {
          frequency = 10;
        }

        state.frequency = frequency;
        this.sendCommand("$PMTK220," + String(1000 / state.frequency));
      }
    },
    restart: {
      // Reboot the receiver
      value: function(coldRestart) {

        if (coldRestart === true) {
          this.sendCommand("$PMTK103");
        } else {
          this.sendCommand("$PMTK101");
          setTimeout(function() {
            this.sendCommand("");
          }.bind(this), 1000);
        }

      }
    }
  }

};


/**
 *
 * @constructor
 *
 * @param {Object} opts Options: pin(s), chip, receiver, breakout, fixed, serialport, frequency
 *
 * Sample initialization
 *
 *    new five.GPS({ pins: {rx: 10, tx: 11});
 *
 */

function GPS(opts) {

  var breakout, receiver, chip, state;

  if (!(this instanceof GPS)) {
    return new GPS(opts);
  }

  // Allow users to pass in a 2 element array for rx and tx pins
  if (Array.isArray(opts)) {
    opts = {
      pins: {
        rx: opts[0],
        tx: opts[1],
        onOff: opts[2]
      }
    };
  }

  if (typeof opts.pins === "undefined") {
    opts.pins = {};
  }

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  // Get user values for breakout, receiver and chip
  breakout = opts.breakout || {};
  receiver = opts.receiver;
  chip = opts.chip;

  // If a breakout is defined check for receiver and chip
  if (Breakouts[breakout]) {
    if (!receiver && Breakouts[breakout].receiver) {
      receiver = Breakouts[breakout].receiver.value;
    }

    if (!chip && Breakouts[breakout].chip) {
      chip = Breakouts[breakout].chip.value;
    }
  }

  // If a receiver was defined or derived but chip was not
  if (!chip) {
    if (receiver && Receivers[receiver].chip) {
      chip = Receivers[receiver].chip.value;
    } else {
      chip = "DEFAULT";
    }
  }

  // Allow users to pass in custom chip types
  chip = typeof chip === "string" ?
    Chips[chip] : opts.chip;

  // Allow users to pass in custom receiver types
  receiver = typeof receiver === "string" ?
    Receivers[receiver] : opts.receiver;

  // Chip decorates the instance
  Object.defineProperties(this, chip);

  // Receiver decorates this instance
  if (receiver) {
    Object.defineProperties(this, receiver);
  }

  // breakout decorates the instance
  if (opts.breakout) {
    breakout = typeof opts.breakout === "string" ?
      Breakouts[opts.breakout] : opts.breakout;

    Board.Controller.call(this, breakout, opts);
  }

  // If necessary set default property values
  this.fixed = opts.fixed || 6;
  this.baud = opts.baud || this.baud;

  // Create a "state" entry for privately
  // storing the state of the instance
  state = {
    sat: {},
    latitude: 0.0,
    longitude: 0.0,
    altitude: 0.0,
    speed: 0.0,
    course: 0.0,
    frequency: 1,
    lowPowerMode: false
  };

  priv.set(this, state);

  // Getters for private state values
  Object.defineProperties(this, {
    latitude: {
      get: function() {
        return state.latitude;
      }
    },
    longitude: {
      get: function() {
        return state.longitude;
      }
    },
    altitude: {
      get: function() {
        return state.altitude;
      }
    },
    sat: {
      get: function() {
        return state.sat;
      }
    },
    speed: {
      get: function() {
        return state.speed;
      }
    },
    course: {
      get: function() {
        return state.course;
      }
    },
    time: {
      get: function() {
        return state.time;
      }
    }
  });

  if (this.initialize) {
    this.initialize(opts);
  }

}

util.inherits(GPS, events.EventEmitter);

/*
 * Default intialization for serial GPS
 */
GPS.prototype.initialize = function(opts) {

  var state = priv.get(this);
  state.portId = opts.serialPort || opts.portId || opts.port || opts.bus;
  
  // firmata.js has a SERIAL_PORT_IDs.DEFAULT that is not 
  // necessary in other IO plugins so it won't always exist. 
  if (typeof state.portId === "undefined" && this.io.SERIAL_PORT_IDs) {
    state.portId = this.io.SERIAL_PORT_IDs.DEFAULT;
  }

  // Set the pin modes
  ["tx", "rx"].forEach(function(pin) {
    if (this.pins[pin]) {
      this.io.pinMode(this.pins[pin], this.io.MODES.SERIAL);
    }
  }, this);

  if (this.pins.onOff) {
    this.io.pinMode(this.pins.onOff, this.io.MODES.OUTPUT);
    this.onOff = new Pin(this.pins.onOff);
  }

  this.io.serialConfig({
    portId: state.portId,
    baud: this.baud,
    rxPin: this.pins.rx,
    txPin: this.pins.tx
  });

  if (this.configure) {
    this.configure(function() {
      this.listen();
      if (opts.frequency) {
        this.frequency = opts.frequency;
      }
    }.bind(this));
  }

};

GPS.prototype.sendCommand = function(string) {

  var state = priv.get(this);
  var cc = [];

  // Convert the string to a charCode array
  for (var i = 0; i < string.length; ++i) {
    cc[i] = string.charCodeAt(i);
  }

  // Append *, checksum and cr/lf
  var hexsum = getNmeaChecksum(string.substring(1));
  cc.push(42, hexsum.charCodeAt(0), hexsum.charCodeAt(1), 13, 10);

  this.io.serialWrite(state.portId, cc);
};

GPS.prototype.listen = function() {

  var state = priv.get(this);
  var input = "";

  // Start the read loop
  this.io.serialRead(state.portId, function(data) {

    input += new Buffer(data).toString("ascii");
    var sentences = input.split("\r\n");

    if (sentences.length > 1) {
      for (var i = 0; i < sentences.length - 1; i++) {
        this.parseNmeaSentence(sentences[i]);
      }
      input = sentences[sentences.length - 1];
    }
  }.bind(this));
};

/*
 * NMEA Sentence Information
 * http://aprs.gids.nl/nmea
 */
GPS.prototype.parseNmeaSentence = function(sentence) {

  var state = priv.get(this);
  var cksum = sentence.split("*");

  // Check for valid sentence
  if (cksum[1] !== getNmeaChecksum(cksum[0].substring(1))) {
    return;
  }

  this.emit("sentence", sentence);

  var segments = cksum[0].split(",");
  var last = {
    latitude: state.latitude,
    longitude: state.longitude,
    altitude: state.altitude,
    speed: state.speed,
    course: state.course
  };

  switch (segments[0]) {
    case "$GPGGA":
      // Time, position and fix related data
      state.time = segments[1];
      state.latitude = degToDec(segments[2], 2, segments[3], this.fixed);
      state.longitude = degToDec(segments[4], 3, segments[5], this.fixed);
      state.altitude = Number(segments[9]);
      break;

    case "$GPGSA":
      // Operating details
      state.sat.satellites = segments.slice(3, 15);
      state.sat.pdop = Number(segments[15]);
      state.sat.hdop = Number(segments[16]);
      state.sat.vdop = Number(segments[17]);
      this.emit("operations", sentence);
      break;

    case "$GPRMC":
      // GPS & Transit data
      state.time = segments[1];
      state.latitude = degToDec(segments[3], 2, segments[4], this.fixed);
      state.longitude = degToDec(segments[5], 3, segments[6], this.fixed);
      state.course = Number(segments[8]);
      state.speed = toFixed(segments[7] * 0.514444, this.fixed);
      break;

    case "$GPVTG":
      // Track Made Good and Ground Speed
      state.course = Number(segments[1]);
      state.speed = toFixed(segments[5] * 0.514444, this.fixed);
      break;

    case "$GPGSV":
      // Satellites in view
      break;

    case "$PGACK":
      // Acknowledge command
      this.emit("acknowledge", sentence);
      break;

    default:
      this.emit("unknown", sentence);
      break;
  }

  this.emit("data", {
    latitude: state.latitude,
    longitude: state.longitude,
    altitude: state.altitude,
    speed: state.speed,
    course: state.course,
    sat: state.sat,
    time: state.time
  });

  if (last.latitude !== state.latitude ||
    last.longitude !== state.longitude ||
    last.altitude !== state.altitude) {

    this.emit("change", {
      latitude: state.latitude,
      longitude: state.longitude,
      altitude: state.altitude
    });
  }

  if (last.speed !== state.speed ||
    last.course !== state.course) {

    this.emit("navigation", {
      speed: state.speed,
      course: state.course
    });
  }

};

// Convert Lat or Lng to decimal degrees
function degToDec(degrees, intDigitsLength, cardinal, fixed) {
  if (degrees) {
    var decimal = Number(degrees.substring(0, intDigitsLength)) + Number(degrees.substring(intDigitsLength)) / 60;

    if (cardinal === "S" || cardinal === "W") {
      decimal *= -1;
    }
    return Number(decimal.toFixed(fixed));
  } else {
    return 0;
  }
}

function getNmeaChecksum(string) {
  var cksum = 0x00;
  for (var i = 0; i < string.length; ++i) {
    cksum ^= string.charCodeAt(i);
  }
  cksum = cksum.toString(16).toUpperCase();

  if (cksum.length < 2) {
    cksum = ("00" + cksum).slice(-2);
  }

  return cksum;
}

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  GPS.Breakouts = Breakouts;
  GPS.Chips = Chips;
  GPS.Receivers = Receivers;
  GPS.purge = function() {
    priv.clear();
  };
}
module.exports = GPS;
