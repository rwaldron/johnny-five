var Emitter = require("events").EventEmitter,
  util = require("util"),
  os = require("os"),
  fs = require("fs"),
  colors = require("colors"),
  _ = require("lodash"),
  __ = require("../lib/fn.js"),
  Repl = require("../lib/repl.js"),
  Options = require("../lib/board.options.js"),
  Pins = require("../lib/board.pins.js"),
  // temporal = require("temporal"),
  serialport,
  IO;

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
var isGalileo = os.release().indexOf("yocto") !== -1;
var isOnBoard = isGalileo;

if (isOnBoard) {
  if (isGalileo) {
    IO = require("galileo-io");
  }
} else {
  IO = require("firmata").Board;
  serialport = require("serialport");
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

  detect: function(callback) {
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
        if (Serial.used.indexOf(val.comName) > -1) {
          available = false;
        }

        return available;
      }).map(function(val) {
        return val.comName;
      });

      length = ports.length;

      // If no ports are detected when scanning /dev/, then there is
      // nothing left to do and we can safely exit the program
      if (!length) {
        // Alert user that no devices were detected
        this.error("Board", "No USB devices detected");

        this.emit("error", {
          message: "No USB devices detected"
        });

        // Return (not that it matters, but this is a good way
        // to indicate to readers of the code that nothing else
        // will happen in this function)
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

        callback.call(this, err, "ready", io);
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

  // Registry of devices by pin address
  this.register = [];

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
    // If you already have a connect io instance
    this.io = opts.io;
    this.isReady = true;
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
      if (this.io.isReady) {
        broadcast.call(this, null, type, this.io);
      } else {
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
      }
    }, this);
  }

  // Cache instance to allow access from module constructors
  boards.push(this);
}

function broadcast(err, type, io) {
  if (err) {
    this.error("Board", err);
  } else {

    // Assign found io to instance
    if (!this.io) {
      this.io = io;
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
      process.exit(15);
    }.bind(this), 1e5);
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
 * pinMode, analogWrite, analogRead, digitalWrite, digitalRead
 *
 * Pass through methods
 */
[
  "pinMode",
  "analogWrite", "analogRead",
  "digitalWrite", "digitalRead"
].forEach(function(method) {
  Board.prototype[method] = function(pin, arg) {
    this.io[method](pin, arg);
    return this;
  };
});


Board.prototype.serialize = function(filter) {
  var blacklist, special;

  blacklist = this.serialize.blacklist;
  special = this.serialize.special;

  return JSON.stringify(
    this.register.map(function(device) {
      return Object.getOwnPropertyNames(device).reduce(function(data, prop) {
        var value = device[prop];

        if (blacklist.indexOf(prop) === -1 &&
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
 * Board.Device
 *
 * Initialize a new device instance
 *
 * Board.Device is a |this| senstive constructor,
 * and must be called as:
 *
 * Board.Device.call( this, opts );
 *
 *
 *
 * TODO: Migrate all constructors to use this
 *       to avoid boilerplate
 */

Board.Device = function(opts) {
  // Board specific properties
  this.board = Board.mount(opts);
  this.io = this.board.io;

  // Device/Module instance properties
  this.id = opts.id || null;

  // Pin or Pins address(es)
  opts = Board.Pins.normalize(opts, this.board);

  if (typeof opts.pins !== "undefined") {
    this.pins = opts.pins || [];
  }

  if (typeof opts.pin !== "undefined") {
    this.pin = opts.pin || 0;
  }

  this.board.register.push(this);
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

module.exports = Board;


// References:
// http://arduino.cc/en/Main/arduinoBoardUno
