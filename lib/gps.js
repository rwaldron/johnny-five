//var IS_TEST_MODE = !!process.env.IS_TEST_MODE;
var Board = require("./board");
var events = require("events");
var util = require("util");
var Pin = require("./pin");

var priv = new Map();

var Breakouts = {

  /*
   * https://www.adafruit.com/products/746
   */
  ADAFRUIT_ULTIMATE_GPS: {
    receiver: {
      value: "FGPMMOPA6H"
    }
  },

  /*
   * https://www.sparkfun.com/products/11058
   */
  SPARKFUN_VENUS_GPS: {
    receiver: {
      value: "Venus638FLPx"
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
  },

  /*
   * https://www.sparkfun.com/products/10919
   */
  Venus638FLPx: {
    chip: {
      value: "Venus638FLPx"
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
    },
    parser: {
      value: "NMEA",
      writable: true
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
    parser: {
      value: "NMEA",
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
  },

  /*
   * http://cdn.sparkfun.com/datasheets/Sensors/GPS/Venus/638/doc/Venus638FLPx_DS_v07.pdf
   * http://cdn.sparkfun.com/datasheets/Sensors/GPS/Venus/638/doc/AN0003_v1.4.19.pdf
   */
  Venus638FLPx: {
    baud: {
      value: 9600
    },
    parser: {
      value: "SKYTRAQ",
      writable: true
    },
    maxSendAttempts: {
      value: 3
    },
    commandAcknowledgeTimeout: {
      value: 500
    },
    sendCommand: {
      value: function(payload, callback) {
        var state = priv.get(this);
        var messageId = payload[0];

        if (payload.length > 0) {
         var cc = [ 0xA0, 0xA1 ]; // Start of sequence
         var lengthBytes = new Buffer(2);
         lengthBytes.writeUInt16BE(payload.length, 0);
         cc.push( lengthBytes[0], lengthBytes[1] ); // Payload length
         cc.push.apply( cc, payload ); // Payload
         cc.push( this.getChecksum( payload ) ); // Checksum
         cc.push( 0x0D, 0x0A ); // End of sequence

         var sendAttempt = function(attempts) {
           if (attempts > 0) {
             if ( state.messageReceipts[ messageId ] === true ) {
               delete state.messageReceipts[ messageId ];
               return callback && callback();
             }
             if ( state.messageReceipts[ messageId ] === false ) {
               delete state.messageReceipts[ messageId ];
               return callback && callback(new Error("NACK"));
             }
           }
           if (attempts <= this.maxSendAttempts ) {
             this.io.serialWrite(state.portId, cc);
             setTimeout(function() {
               sendAttempt( attempts + 1 );
             }.bind(this), this.commandAcknowledgeTimeout);
           } else {
             return callback && callback(new Error("Maximum send attempts exceeded without ACK or NACK"));
           }
         }.bind(this);
         sendAttempt(0);
        }
      }
    },
    listen: {
      value: function() {
        var state = priv.get(this);
        var input = "";

        // Start the read loop
        this.io.serialRead(state.portId, function(data) {
          input += new Buffer(data).toString("binary");
          var sentences = input.split("\r\n");

          if (sentences.length > 1) {
            for (var i = 0; i < sentences.length - 1; i++) {
              this.parseSentence(sentences[i]);
            }
            input = sentences[sentences.length - 1];
          }
        }.bind(this));
      }
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
        // Value with 1, 2, 4, 5, 8, 10 or 20
        if ([1,2,4,5,8,10,20].indexOf(frequency) !== -1) {
          this.sendCommand([ 0x0E, frequency, 0 ]);
        } else {
          // Should this throw an error?
        }
      }
    },
    restart: {
      // Reboot the receiver
      value: function(coldRestart) {
        if (coldRestart === true) {
          this.sendCommand([ 0x01, 0x03, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);
        } else {
          this.sendCommand([ 0x01, 0x01, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);
        }
      }
    }
  }

};

// Sentence Parsers
var PARSERS = {
  NMEA: {
    parseSentence: {
      value: function(sentence) {

        var state = priv.get(this);
        var cksum = sentence.split("*");

        // Check for valid sentence
        if (cksum[1] !== this.getChecksum(cksum[0].substring(1))) {
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
            state.speed = Number((segments[7] * 0.514444).toFixed(this.fixed));
            break;

          case "$GPVTG":
            // Track Made Good and Ground Speed
            state.course = Number(segments[1]);
            state.speed = Number((segments[5] * 0.514444).toFixed(this.fixed));
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
      },
      writable: true
    },
    getChecksum: {
      value: function(string) {
        var cksum = 0x00;
        for (var i = 0; i < string.length; ++i) {
          cksum ^= string.charCodeAt(i);
        }
        cksum = cksum.toString(16).toUpperCase();

        if (cksum.length < 2) {
          cksum = ("00" + cksum).slice(-2);
        }

        return cksum;
      },
      writable: true
    }
  },
  SKYTRAQ: {
    parseSentence: {
      value: function(sentence) {
        var state = priv.get(this);

        var payloadLength = new Buffer( sentence.slice(2,4), "binary" ).readUInt16BE(0);
        var payload = new Buffer( sentence.slice(4, payloadLength + 4), "binary" );
        var cksum = sentence.slice(payloadLength + 4).charCodeAt(0);

        if (cksum !== this.getChecksum(payload)) {
          return;
        }

        var messageId = payload[0];
        var messageBody = payload.slice(1);

        switch (messageId) {
          case 0x83: // ACK
            state.messageReceipts[ messageBody[0] ] = true;
            this.emit("acknowledge", payload);
            break;
          case 0x84: // NACK
            state.messageReceipts[ messageBody[0] ] = false;
            this.emit("failure", payload);
            break;
          default:
            this.emit("unknown", payload);
        }
      },
      writable: true
    },
    getChecksum: {
      value: function(buffer) {
        var cksum = 0x00;
        for (var i=0; i<buffer.length; i++) {
          cksum ^= buffer[i];
        }
        return cksum;
      },
      writable: true
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

  var breakout, receiver, chip, parser, state;

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

  // If no parser was passed use the parser defined on the chip
  parser = opts.parser || this.parser;

  // Allow users to pass in custom parsers
  parser = typeof parser === "string" ?
    PARSERS[parser] : parser;

  // parser decorates the instance
  Object.defineProperties(this, parser);

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
    messageReceipts: {},
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
  state.portId = opts.serialPort || opts.portId || opts.port || opts.bus || this.io.SERIAL_PORT_IDs.DEFAULT;

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
  var hexsum = this.getChecksum(string.substring(1));
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
        this.parseSentence(sentences[i]);
      }
      input = sentences[sentences.length - 1];
    }
  }.bind(this));
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

module.exports = GPS;
