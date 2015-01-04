require("es6-shim");
require("array-includes").shim();

var IS_TEST_MODE = global.IS_TEST_MODE || false;
var Emitter = require("events").EventEmitter;
var util = require("util");
var os = require("os");
var colors = require("colors");
var _ = require("lodash");
var __ = require("../lib/fn.js");
var Repl = require("../lib/repl.js");
var Options = require("../lib/board.options.js");
var Pins = require("../lib/board.pins.js");
// var temporal = require("temporal"),
var IO;

// Environment Setup
var boards = [];
var rport = /usb|acm|^com/i;
var port = "";

// TODO:
//
//    At some point we should figure out a way to
//    make execution-on-board environments uniformally
//    detected and reported.
//
var isGalileo = (function() {
  var release = os.release();
  return release.includes("yocto") ||
    release.includes("edison");
})();
var isOnBoard = isGalileo;

if (isOnBoard) {
  if (isGalileo) {
    IO = require("galileo-io");
  }
}

/**
 * Process Codes
 * SIGHUP        1       Term    Hangup detected on controlling terminal
                              or death of controlling process
 * SIGINT        2       Term    Interrupt from keyboard
 * SIGQUIT       3       Core    Quit from keyboard
 * SIGILL        4       Core    Illegal Instruction
 * SIGABRT       6       Core    Abort signal from abort(3)
 * SIGFPE        8       Core    Floating point exception
 * SIGKILL       9       Term    Kill signal
 * SIGSEGV      11       Core    Invalid memory reference
 * SIGPIPE      13       Term    Broken pipe: write to pipe with no readers
 * SIGALRM      14       Term    Timer signal from alarm(2)
 * SIGTERM      15       Term    Termination signal
 *
 *
 *
 * http://www.slac.stanford.edu/BFROOT/www/Computing/Environment/Tools/Batch/exitcode.html
 *
 */

var Serial = {

  used: [],
  attempts: [],

  detect: function(callback) {
    var serialport = IS_TEST_MODE ?
      require("../test/mock-serial") :
      require("serialport");

    // Request a list of available ports, from
    // the result set, filter for valid paths
    // via known path pattern match.
    serialport.list(function(err, result) {
      var ports,
        length;

      ports = result.filter(function(val) {
        var available = true;

        // Match only ports that Arduino cares about
        // ttyUSB#, cu.usbmodem#, COM#
        if (!rport.test(val.comName)) {
          available = false;
        }

        // Don't allow already used/encountered usb device paths
        if (Serial.used.includes(val.comName)) {
          available = false;
        }

        return available;
      }).map(function(val) {
        return val.comName;
      });

      length = ports.length;

      // If no ports are detected...
      if (!length) {

        // Create an attempt counter
        if (!Serial.attempts[Serial.used.length]) {
          Serial.attempts[Serial.used.length] = 0;

          // Log notification...
          this.info("Looking for connected device", "");
        }

        // Set the attempt number
        Serial.attempts[Serial.used.length]++;

        // Retry Serial connection
        Serial.detect.call(this, callback);

        return;
      }

      this.info(
        "Device(s)",
        ports.toString().grey
      );

      // Get the first available device path from the list of
      // detected ports
      callback.call(this, ports[0]);
    }.bind(this));
  },

  connect: function(portOrPath, callback) {
    var IO = require("firmata").Board;
    var err, io, isConnected, path, type;

    if (typeof portOrPath === "object" && portOrPath.path) {
      //
      // Board({ port: SerialPort Object })
      //
      path = portOrPath.path;

      this.info(
        "SerialPort",
        path.grey
      );
    } else {
      //
      // Board({ port: path String })
      //
      // Board()
      //    ie. auto-detected
      //
      path = portOrPath;
    }

    // Add the usb device path to the list of device paths that
    // are currently in use - this is used by the filter function
    // above to remove any device paths that we've already encountered
    // or used to avoid blindly attempting to reconnect on them.
    Serial.used.push(path);

    try {
      io = new IO(portOrPath, function(error) {
        if (error !== undefined) {
          err = error;
        }

        callback.call(this, err, err ? "error" : "ready", io);
      }.bind(this));

      // Extend io instance with special expandos used
      // by Johny-Five for the IO Plugin system.
      io.name = "Firmata";
      io.transport = "Serialport";
      io.defaultLed = 13;
      io.port = path;

      // Made this far, safely connected
      isConnected = true;
    } catch (error) {
      err = error;
    }

    if (err) {
      err = err.message || err;
    }

    // Determine the type of event that will be passed on to
    // the board emitter in the callback passed to Serial.detect(...)
    type = isConnected ? "connect" : "error";

    // Execute "connect" callback
    callback.call(this, err, type, io);
  }
};

/**
 * Board
 * @constructor
 *
 * @param {Object} opts
 */

function Board(opts) {

  if (!(this instanceof Board)) {
    return new Board(opts);
  }

  // Ensure opts is an object
  opts = opts || {};

  var inject, isPostponed;

  inject = {};

  // Initialize this Board instance with
  // param specified properties.
  _.assign(this, opts);

  this.timer = null;

  this.isConnected = false;

  // Easily track state of hardware
  this.isReady = false;

  // Initialize instance property to reference io board
  this.io = this.io || null;

  // Registry of components
  this.register = [];

  // Pins, Addr (alt Pin name), Addresses
  this.occupied = [];

  // Registry of drivers by address (i.e. I2C Controllers)
  this.Drivers = {};

  // Identify for connect hardware cache
  if (!this.id) {
    this.id = __.uid();
  }

  // If no debug flag, default to true
  if (!("debug" in this)) {
    this.debug = true;
  }

  if (!("repl" in this)) {
    this.repl = true;
  }

  // Specially processed pin capabilities object
  // assigned when board is initialized and ready
  this.pins = null;

  // Human readable name (if one can be detected)
  this.type = "";

  // Create a Repl instance and store as
  // instance property of this io/board.
  // This will reduce the amount of boilerplate
  // code required to _always_ have a Repl
  // session available.
  //
  // If a sesssion exists, use it
  // (instead of creating a new session)
  //
  if (this.repl) {
    if (Repl.ref) {

      inject[this.id] = this;

      Repl.ref.on("ready", function() {
        Repl.ref.inject(inject);
      });

      this.repl = Repl.ref;
    } else {
      inject[this.id] = inject.board = this;
      this.repl = new Repl(inject);
    }
  }

  if (opts.io) {
    // If you already have a connected io instance
    this.io = opts.io;
    this.isReady = opts.io.isReady;
    this.transport = this.io.transport || "unknown transport";
    this.port = this.io.name;
    this.pins = Board.Pins(this);
  } else {

    if (isOnBoard) {
      this.io = new IO();
      this.port = this.io.name;
    } else {
      if (this.port && opts.port) {
        Serial.connect.call(this, this.port, broadcast);
      } else {
        // TODO: refactor to do the path lookups
        // as soon as this file is required.
        Serial.detect.call(this, function(path) {
          Serial.connect.call(this, path, broadcast);
        });
      }
    }
  }

  // Either an IO instance was provided or isOnBoard is true
  if (!opts.port && this.io !== null) {
    this.info(
      "Device(s)", (this.io.name || "unknown").grey
    );
    isPostponed = false;

    ["connect", "ready"].forEach(function(type) {
      this.io.once(type, function() {
        // Since connection and readiness happen asynchronously,
        // it's actually possible for Johnny-Five to receive the
        // events out of order and that should be ok.
        if (type === "ready" && !this.isConnected) {
          isPostponed = true;
        } else {
          broadcast.call(this, null, type, this.io);
        }

        if (type === "connect" && isPostponed) {
          broadcast.call(this, null, "ready", this.io);
        }
      }.bind(this));

      if (this.io.isReady) {
        // If the IO instance is reached "ready"
        // state, queue tick tasks to emit the
        // "connect" and "ready" events

        process.nextTick(function() {
          this.io.emit(type);
        }.bind(this));
      }
    }, this);
  }

  // Cache instance to allow access from module constructors
  boards.push(this);
}

function broadcast(err, type, io) {
  // Assign found io to instance
  if (!this.io) {
    this.io = io;
  }

  if (type === "error") {
    if (err && err.message) {
      console.log(err.message.red);
    }
  }

  if (type === "connect") {
    this.isConnected = true;

    // 10 Second timeout...
    //
    // If "ready" hasn't fired and cleared the timer within
    // 10 seconds of the connect event, then it's likely
    // there is an issue with the device or firmware.
    this.timer = setTimeout(function() {

      this.error(
        "Device or Firmware Error",
        "A timeout occurred while connecting to the Board. \n" +
        "Please check that you've properly flashed the board with the correct firmware."
      );

      this.emit("error", "A timeout occurred while connecting to the Board.");
    }.bind(this), 1e4);
  }

  if (type === "ready") {
    clearTimeout(this.timer);

    // Update instance `ready` flag
    this.isReady = true;
    this.port = io.port || io.name;
    this.pins = Board.Pins(this);

    this.info(
      "Connected",
      this.port.grey
    );

    // In multi-board mode, block the REPL from
    // activation. This will be started directly
    // by the Board.Array constructor.
    if (!Repl.isBlocked) {
      process.stdin.emit("data", "1");
    }

    if (io.name !== "Mock") {
      process.on("SIGINT", function() {
        this.warn("Board", "Closing.");
        process.exit(0);
      }.bind(this));
    }

    // Bubble "string" events from IO layer
    io.on("string", function(data) {
      this.emit("string", data);
    }.bind(this));
  }


  // process.on("SIGINT", function() {
  //   console.log( "exit...." );
  //   // On ^c, make sure we close the process after the
  //   // io and serialport are closed. Approx 100ms
  //   // TODO: this sucks, need better solution
  //   setTimeout(function() {
  //     process.exit();
  //   }, 100);
  // }.bind(this));


  // emit connect|ready event
  this.emit(type, err);
}

// Inherit event api
util.inherits(Board, Emitter);



/**
 * Pass through methods
 */
[
  "digitalWrite", "analogWrite", "servoWrite", "sendI2CWriteRequest",
  "analogRead", "digitalRead", "sendI2CReadRequest",
  "pinMode", "queryPinState", "sendI2CConfig",
  "stepperStep", "stepperConfig", "servoConfig"
].forEach(function(method) {
  Board.prototype[method] = function(pin, arg) {
    this.io[method](pin, arg);
    return this;
  };
});


Board.prototype.serialize = function(filter) {
  var blacklist = this.serialize.blacklist;
  var special = this.serialize.special;

  return JSON.stringify(
    this.register.map(function(device) {
      return Object.getOwnPropertyNames(device).reduce(function(data, prop) {
        var value = device[prop];

        if (!blacklist.includes(prop) &&
            typeof value !== "function") {

          data[prop] = special[prop] ?
            special[prop](value) : value;

          if (filter) {
            data[prop] = filter(prop, data[prop], device);
          }
        }
        return data;
      }, {});
    }, this)
  );
};

Board.prototype.serialize.blacklist = [
  "board", "io", "_events"
];

Board.prototype.samplingInterval = function(ms) {

  if (this.io.setSamplingInterval) {
    this.io.setSamplingInterval(ms);
  } else {
    console.log("This IO plugin does not implement an interval adjustment method");
  }
  return this;
};


Board.prototype.serialize.special = {
  mode: function(value) {
    return ["INPUT", "OUTPUT", "ANALOG", "PWM", "SERVO"][value] || "unknown";
  }
};

/**
 *  shiftOut
 *
 */
Board.prototype.shiftOut = function(dataPin, clockPin, isBigEndian, value) {
  var mask, write;

  write = function(value, mask) {
    this.digitalWrite(clockPin, this.io.LOW);
    this.digitalWrite(
      dataPin, this.io[value & mask ? "HIGH" : "LOW"]
    );
    this.digitalWrite(clockPin, this.io.HIGH);
  }.bind(this);

  if (arguments.length === 3) {
    value = arguments[2];
    isBigEndian = true;
  }

  if (isBigEndian) {
    for (mask = 128; mask > 0; mask = mask >> 1) {
      write(value, mask);
    }
  } else {
    for (mask = 0; mask < 128; mask = mask << 1) {
      write(value, mask);
    }
  }
};

Board.prototype.log = function( /* type, module, message [, long description] */ ) {
  var args = [].slice.call(arguments),
    type = args.shift(),
    module = args.shift(),
    message = args.shift(),
    color = Board.prototype.log.types[type];

  if (this.debug) {
    console.log([
      // Timestamp
      String(+new Date()).grey,
      // Module, color matches type of log
      module.magenta,
      // Message
      message[color],
      // Miscellaneous args
      args.join(", ")
    ].join(" "));
  }
};

Board.prototype.log.types = {
  error: "red",
  fail: "orange",
  warn: "yellow",
  info: "cyan"
};

// Make shortcuts to all logging methods
Object.keys(Board.prototype.log.types).forEach(function(type) {
  Board.prototype[type] = function() {
    var args = [].slice.call(arguments);
    args.unshift(type);

    this.log.apply(this, args);
  };
});


/**
 * delay, loop, queue
 *
 * Pass through methods to temporal
 */
/*
[
  "delay", "loop", "queue"
].forEach(function( method ) {
  Board.prototype[ method ] = function( time, callback ) {
    temporal[ method ]( time, callback );
    return this;
  };
});

// Alias wait to delay to match existing Johnny-five API
Board.prototype.wait = Board.prototype.delay;
*/

// -----THIS IS A TEMPORARY FIX UNTIL THE ISSUES WITH TEMPORAL ARE RESOLVED-----
// Aliasing.
// (temporary, while ironing out API details)
// The idea is to match existing hardware programming apis
// or simply find the words that are most intuitive.

// Eventually, there should be a queuing process
// for all new callbacks added
//
// TODO: Repalce with temporal or compulsive API

Board.prototype.wait = function(time, callback) {
  setTimeout(callback.bind(this), time);
  return this;
};

Board.prototype.loop = function(time, callback) {
  setInterval(callback.bind(this), time);
  return this;
};

// ----------
// Static API
// ----------

// Board.map( val, fromLow, fromHigh, toLow, toHigh )
//
// Re-maps a number from one range to another.
// Based on arduino map()
Board.map = __.map;
Board.fmap = __.fmap;

// Board.constrain( val, lower, upper )
//
// Constrains a number to be within a range.
// Based on arduino constrain()
Board.constrain = __.constrain;

// Board.range( upper )
// Board.range( lower, upper )
// Board.range( lower, upper, tick )
//
// Returns a new array range
//
Board.range = __.range;

// Board.range.prefixed( prefix, upper )
// Board.range.prefixed( prefix, lower, upper )
// Board.range.prefixed( prefix, lower, upper, tick )
//
// Returns a new array range, each value prefixed
//
Board.range.prefixed = __.range.prefixed;

// Board.uid()
//
// Returns a reasonably unique id string
//
Board.uid = __.uid;

// Board.mount()
// Board.mount( index )
// Board.mount( object )
//
// Return hardware instance, based on type of param:
// @param {arg}
//   object, user specified
//   number/index, specified in cache
//   none, defaults to first in cache
//
// Notes:
// Used to reduce the amount of boilerplate
// code required in any given module or program, by
// giving the developer the option of omitting an
// explicit Board reference in a module
// constructor's options
Board.mount = function(arg) {
  var index = typeof arg === "number" && arg,
    hardware;

  // board was explicitly provided
  if (arg && arg.board) {
    return arg.board;
  }

  // index specified, attempt to return
  // hardware instance. Return null if not
  // found or not available
  if (index) {
    hardware = boards[index];
    return hardware && hardware || null;
  }

  // If no arg specified and hardware instances
  // exist in the cache
  if (boards.length) {
    return boards[0];
  }

  // No mountable hardware
  return null;
};



/**
 * Board.Component
 *
 * Initialize a new device instance
 *
 * Board.Component is a |this| senstive constructor,
 * and must be called as:
 *
 * Board.Component.call( this, opts );
 *
 *
 *
 * TODO: Migrate all constructors to use this
 *       to avoid boilerplate
 */

Board.Component = function(opts) {
  if (typeof opts === "undefined") {
    opts = {};
  }

  // Board specific properties
  this.board = Board.mount(opts);
  this.io = this.board.io;

  // Component/Module instance properties
  this.id = opts.id || null;

  // Pin or Pins address(es)
  opts = Board.Pins.normalize(opts, this.board);

  var requesting = [];

  if (typeof opts.pins !== "undefined") {
    this.pins = opts.pins || [];

    if (Array.isArray(this.pins)) {
      requesting = requesting.concat(
        this.pins.map(function(pin) {
          return {
            value: pin,
            type: "pin"
          };
        })
      );
    } else {
      requesting = requesting.concat(
        Object.keys(this.pins).map(function(key) {
          return {
            value: this.pins[key],
            type: "pin"
          };
        }, this)
      );
    }
  }

  if (typeof opts.pin !== "undefined") {
    this.pin = opts.pin;
    requesting.push({
      value: this.pin,
      type: "pin"
    });
  }

  if (typeof opts.address !== "undefined") {
    this.address = opts.address;
    requesting.push({
      value: this.address,
      type: "address"
    });
  }

  // TODO: Kill this.
  if (typeof opts.addr !== "undefined") {
    this.addr = opts.addr;
    requesting.push({
      value: this.addr,
      type: "addr"
    });
  }

  // With the pins being requested for use by this component,
  // compare with the list of pins that are already known to be
  // in use by other components. If any are known to be in use,
  // produce a warning for the user.
  requesting.forEach(function(request) {
    var isOccupied = this.board.occupied.some(function(occupied) {
      return request.value === occupied.value && request.type === occupied.type;
    });

    if (isOccupied) {
      this.board.warn("%s %s already in use", request.type, request.value);
    } else {
      this.board.occupied.push(request);
    }
  }, this);

  this.board.register.push(this);
};


Board.Device = function(opts) {
  Board.Component.call(this, opts);
};


/**
 * Pin Capability Signature Mapping
 */

Board.Pins = Pins;

Board.Options = Options;

// Define a user-safe, unwritable hardware cache access
Object.defineProperty(Board, "cache", {
  get: function() {
    return boards;
  }
});

/**
 * Board event constructor.
 * opts:
 *   type - event type. eg: "read", "change", "up" etc.
 *   target - the instance for which the event fired.
 *   0..* other properties
 */
Board.Event = function(opts) {

  if (!(this instanceof Board.Event)) {
    return new Board.Event(opts);
  }

  opts = opts || {};

  // default event is read
  this.type = opts.type || "read";

  // actual target instance
  this.target = opts.target || null;

  // Initialize this Board instance with
  // param specified properties.
  _.assign(this, opts);
};


/**
 * Boards or Board.Array; Used when the program must connect to
 * more then one board.
 *
 * @memberof Board
 *
 * @param {Array} ports List of port objects { id: ..., port: ... }
 *                      List of id strings (initialized in order)
 *
 * @return {Boards} board object references
 */
Board.Array = function(ports) {
  if (!(this instanceof Board.Array)) {
    return new Board.Array(ports);
  }

  if (!Array.isArray(ports)) {
    throw new Error("Expected ports to be an array");
  }

  Array.call(this, ports.length);
  this.length = 0;

  var initialized, count;

  initialized = {};
  count = ports.length;

  // Block initialization of the program's
  // REPL until all boards are ready.
  Repl.isBlocked = true;

  ports.forEach(function(port, k) {
    var opts;

    if (typeof port === "string") {
      opts = {
        id: port
      };
    } else {
      opts = port;
    }

    this[k] = initialized[opts.id] = new Board(opts);
    this[k].on("ready", function() {

      this[k].info("Board ID: ", opts.id.green);

      if (!--count) {
        Repl.isBlocked = false;

        process.stdin.emit("data", "1");

        this.emit("ready", initialized);
      }
    }.bind(this));

    this.length++;
  }, this);
};

util.inherits(Board.Array, Emitter);

Board.Array.prototype.each = Array.prototype.forEach;


if (IS_TEST_MODE) {
  Board.__spy = {
    Serial: Serial
  };

  Board.purge = function() {
    Board.Pins.normalize.convert = null;
    boards.length = 0;
  };
}

module.exports = Board;


// References:
// http://arduino.cc/en/Main/arduinoBoardUno
