if (!Array.from || !Object.assign || !Map) {
  require("es6-shim");
}
if (!Array.prototype.includes) {
  require("./array-includes-shim");
}


var IS_TEST_MODE = !!process.env.IS_TEST_MODE;
var Emitter = require("events").EventEmitter;
var util = require("util");
// var os = require("os");
var chalk = require("chalk");
var Collection = require("./mixins/collection");
var Fn = require("./fn");
var Repl = require("./repl.js");
var Options = require("./board.options.js");
var Pins = require("./board.pins.js");
var Expander;
//var temporal = require("temporal");
//var IO;

// Environment Setup
var boards = [];
var rport = /usb|acm|^com/i;

// TODO:
//
//    At some point we should figure out a way to
//    make execution-on-board environments uniformally
//    detected and reported.
//
// var isGalileo = (function() {
//   var release = os.release();
//   return release.includes("yocto") ||
//     release.includes("edison");
// })();
// var isOnBoard = isGalileo;

// if (isOnBoard) {
//   if (isGalileo) {
//     IO = require("galileo-io");
//   }
// }

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

    var serialport;

    if (parseFloat(process.versions.nw) >= 0.13) {
      serialport = require("browser-serialport");
    } else {
      serialport = require("serialport");
    }

    // Request a list of available ports, from
    // the result set, filter for valid paths
    // via known path pattern match.
    serialport.list(function(err, result) {

      // serialport.list() will never result in an error.
      // On failure, an empty array is returned. (#768)
      var ports = result.filter(function(val) {
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

      // If no ports are detected...
      if (!ports.length) {

        if (IS_TEST_MODE && this.abort) {
          return;
        }

        // Create an attempt counter
        if (!Serial.attempts[Serial.used.length]) {
          Serial.attempts[Serial.used.length] = 0;

          // Log notification...
          this.info("Board", "Looking for connected device");
        }

        // Set the attempt number
        Serial.attempts[Serial.used.length]++;

        // Retry Serial connection
        Serial.detect.call(this, callback);
        return;
      }

      this.info(
        "Device(s)",
        chalk.grey(ports)
      );

      // Get the first available device path
      // from the list of detected ports

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
        (portOrPath.transport || "SerialPort"),
        chalk.grey(path)
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

  // Used to define the board instance's own
  // properties in the REPL's scope.
  var replContext = {};

  // It's feasible that an IO-Plugin may emit
  // "connect" and "ready" events out of order.
  // This is used to enforce the order, by
  // postponing the "ready" event if the IO-Plugin
  // hasn't emitted a "connect" event. Once
  // the "connect" event is emitted, the
  // postponement is lifted and the board may
  // proceed with emitting the events in the
  // correct order.
  var isPostponed = false;

  // Initialize this Board instance with
  // param specified properties.
  Object.assign(this, opts);

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
    this.id = Fn.uid();
  }

  // If no debug flag, default to true
  if (typeof this.debug === "undefined") {
    this.debug = true;
  }

  // If no repl flag, default to true
  if (typeof this.repl === "undefined") {
    this.repl = true;
  }

  // If no sigint flag, default to true
  if (typeof this.sigint === "undefined") {
    this.sigint = true;
  }

  // Specially processed pin capabilities object
  // assigned when physical board has reported
  // "ready" via Firmata or IO-Plugin.
  this.pins = null;

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

      replContext[this.id] = this;

      Repl.ref.on("ready", function() {
        Repl.ref.inject(replContext);
      });

      this.repl = Repl.ref;
    } else {
      replContext[this.id] = replContext.board = this;
      this.repl = new Repl(replContext);
    }
  }

  if (opts.io) {
    // If you already have a connected io instance
    this.io = opts.io;
    this.isReady = opts.io.isReady;
    this.transport = this.io.transport || null;
    this.port = this.io.name;
    this.pins = Board.Pins(this);
  } else {

    // if (isOnBoard) {
    //   this.io = new IO();
    //   this.port = this.io.name;
    // } else {
    if (this.port && opts.port) {
      Serial.connect.call(this, this.port, finalizeAndBroadcast);
    } else {
      // TODO: refactor to do the path lookups
      // as soon as this file is required.
      Serial.detect.call(this, function(path) {
        Serial.connect.call(this, path, finalizeAndBroadcast);
      });
    }
    // }
  }

  // Either an IO instance was provided or isOnBoard is true
  if (!opts.port && this.io !== null) {
    this.info(
      "Device(s)", chalk.grey(this.io.name || "unknown")
    );

    ["connect", "ready"].forEach(function(type) {
      this.io.once(type, function() {
        // Since connection and readiness happen asynchronously,
        // it's actually possible for Johnny-Five to receive the
        // events out of order and that should be ok.
        if (type === "ready" && !this.isConnected) {
          isPostponed = true;
        } else {
          // Will emit the "connect" and "ready" events
          // if received in order. If out of order, this
          // will only emit the "connect" event. The
          // "ready" event will be handled in the next
          // condition's consequent.
          finalizeAndBroadcast.call(this, null, type, this.io);
        }

        if (type === "connect" && isPostponed) {
          finalizeAndBroadcast.call(this, null, "ready", this.io);
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

  this.once("ready", function() {
    var hrstart = process.hrtime();

    this.millis = function() {
      var now = process.hrtime(hrstart);
      return (now[1] / 1000000);
    };

    ["close", "disconnect", "error", "string"].forEach(function(type) {
      this.io.on(type, function(data) {
        this.emit(type, data);
      }.bind(this));
    }, this);
  }.bind(this));

  // Cache instance to allow access from module constructors
  boards.push(this);
}

function finalizeAndBroadcast(err, type, io) {
  // Assign found io to instance
  if (!this.io) {
    this.io = io;
  }

  if (type === "error") {
    if (err && err.message) {
      console.log(chalk.red(err.message));
    }
  }

  if (type === "connect") {
    this.isConnected = true;
    this.port = io.port || io.name;

    this.info(
      "Connected",
      chalk.grey(this.port)
    );

    // Unless a "timeout" value has been provided apply 10 Second timeout...
    //
    // If "ready" hasn't fired and cleared the timer within
    // 10 seconds of the connect event, then it's likely
    // there is an issue with the device or firmware.
    if (!IS_TEST_MODE) {
      this.timer = setTimeout(function() {
        this.error(
          "Device or Firmware Error",

          "A timeout occurred while connecting to the Board. \n\n" +
          "Please check that you've properly flashed the board with the correct firmware.\n" +
          "See: https://github.com/rwaldron/johnny-five/wiki/Getting-Started#trouble-shooting\n\n" +
          "If connecting to a Leonardo or Leonardo clone, press the 'Reset' button on the " +
          "board, wait approximately 11 seconds for complete reset, then run your program again."
        );

        this.emit("error", new Error("A timeout occurred while connecting to the Board."));
      }.bind(this), this.timeout || 1e4);
    }
  }

  if (type === "ready") {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    // Update instance `ready` flag
    this.isReady = true;
    this.pins = Board.Pins(this);
    this.MODES = this.io.MODES;

    if (typeof io.debug !== "undefined" &&
        io.debug === false) {
      this.debug = false;
    }

    if (typeof io.repl !== "undefined" &&
        io.repl === false) {
      this.repl = false;
    }
    // In multi-board mode, block the REPL from
    // activation. This will be started directly
    // by the Board.Collection constructor.
    //
    // In single-board mode, the REPL will not
    // be blocked at all.
    //
    // If the user program has not disabled the
    // REPL, initialize it.
    if (this.repl) {
      this.repl.initialize(this.emit.bind(this, "ready"));
    }

    if (io.name !== "Mock" && this.sigint) {
      process.on("SIGINT", function() {
        this.emit("exit");
        this.warn("Board", "Closing.");
        process.nextTick(process.reallyExit);
      }.bind(this));
    }
  }

  // If there is a REPL...
  if (this.repl) {
    // "ready" will be emitted once repl.initialize
    // is complete, so the only event that needs to
    // be propagated here is the "connect" event.
    if (type === "connect") {
      this.emit(type, err);
    }
  } else {
    // The REPL is disabled, propagate all events
    this.emit(type, err);
  }
}

// Inherit event api
util.inherits(Board, Emitter);



/**
 * Pass through methods
 */
[
  "digitalWrite", "analogWrite",
  "analogRead", "digitalRead",
  "pinMode", "queryPinState",
  "stepperConfig", "stepperStep",
  "sendI2CConfig", "sendI2CWriteRequest", "sendI2CReadRequest",
  "i2cConfig", "i2cWrite", "i2cWriteReg", "i2cRead", "i2cReadOnce",
  "pwmWrite",
  "servoConfig", "servoWrite",
  "sysexCommand", "sysexResponse",
  "serialConfig", "serialWrite", "serialRead", "serialStop", "serialClose", "serialFlush", "serialListen",
].forEach(function(method) {
  Board.prototype[method] = function() {
    this.io[method].apply(this.io, arguments);
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
  if (arguments.length === 3) {
    value = isBigEndian;
    isBigEndian = true;
  }

  for (var i = 0; i < 8; i++) {
    this.io.digitalWrite(clockPin, 0);
    if (isBigEndian) {
      this.io.digitalWrite(dataPin, !!(value & (1 << (7 - i))));
    } else {
      this.io.digitalWrite(dataPin, !!(value & (1 << i)));
    }
    this.io.digitalWrite(clockPin, 1);
  }
};

var logging = {
  specials: [
    "error",
    "fail",
    "warn",
    "info",
  ],
  colors: {
    log: "white",
    error: "red",
    fail: "inverse",
    warn: "yellow",
    info: "cyan"
  }
};

Board.prototype.log = function( /* type, klass, message [, long description] */ ) {
  var args = [].slice.call(arguments);

  // If this was a direct call to `log(...)`, make sure
  // there is a correct "type" to emit below.
  if (!logging.specials.includes(args[0])) {
    args.unshift("log");
  }

  var type = args.shift();
  var klass = args.shift();
  var message = args.shift();
  var color = logging.colors[type];
  var now = Date.now();
  var event = {
    type: type,
    timestamp: now,
    class: klass,
    message: "",
    data: null,
  };

  if (typeof args[args.length - 1] === "object") {
    event.data = args.pop();
  }

  message += " " + args.join(", ");
  event.message = message.trim();

  if (this.debug) {
    console.log([
      // Timestamp
      chalk.grey(now),
      // Module, color matches type of log
      chalk.magenta(klass),
      // Details
      chalk[color](message),
      // Miscellaneous args
      args.join(", ")
    ].join(" "));
  }

  this.emit(type, event);
  this.emit("message", event);
};


// Make shortcuts to all logging methods
logging.specials.forEach(function(type) {
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
  setTimeout(callback, time);
  return this;
};

Board.prototype.loop = function(time, callback) {
  var handler = function() {
    callback(function() {
      clearInterval(interval);
    });
  };
  var interval = setInterval(handler, time);
  return this;
};

// ----------
// Static API
// ----------

// Board.map( val, fromLow, fromHigh, toLow, toHigh )
//
// Re-maps a number from one range to another.
// Based on arduino map()
Board.map = Fn.map;
Board.fmap = Fn.fmap;

// Board.constrain( val, lower, upper )
//
// Constrains a number to be within a range.
// Based on arduino constrain()
Board.constrain = Fn.constrain;

// Board.range( upper )
// Board.range( lower, upper )
// Board.range( lower, upper, tick )
//
// Returns a new array range
//
Board.range = Fn.range;

// Board.range.prefixed( prefix, upper )
// Board.range.prefixed( prefix, lower, upper )
// Board.range.prefixed( prefix, lower, upper, tick )
//
// Returns a new array range, each value prefixed
//
Board.range.prefixed = Fn.range.prefixed;

// Board.uid()
//
// Returns a reasonably unique id string
//
Board.uid = Fn.uid;

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
 * Board.Component is a |this| sensitive constructor,
 * and must be called as:
 *
 * Board.Component.call( this, opts );
 *
 *
 *
 * TODO: Migrate all constructors to use this
 *       to avoid boilerplate
 */

Board.Component = function(opts, componentOpts) {
  if (typeof opts === "undefined") {
    opts = {};
  }

  if (typeof componentOpts === "undefined") {
    componentOpts = {};
  }

  // Board specific properties
  this.board = Board.mount(opts);
  this.io = this.board.io;

  // Component/Module instance properties
  this.id = opts.id || Board.uid();
  this.custom = opts.custom || {};

  var originalPins;

  if (typeof opts.pin === "number" || typeof opts.pin === "string") {
    originalPins = [opts.pin];
  } else {
    if (Array.isArray(opts.pins)) {
      originalPins = opts.pins.slice();
    } else {
      if (typeof opts.pins === "object" && opts.pins !== null) {

        var pinset = opts.pins || opts.pin;

        originalPins = [];
        for (var p in pinset) {
          originalPins.push(pinset[p]);
        }
      }
    }
  }

  if (!Expander) {
    Expander = require("./expander");
  }

  if (opts.controller && Expander.hasController(opts.controller)) {
    componentOpts = {
      normalizePin: false,
      requestPin: false,
    };
  }

  componentOpts = Board.Component.initialization(componentOpts);

  if (componentOpts.normalizePin) {
    opts = Board.Pins.normalize(opts, this.board);
  }

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

  if (typeof opts.emitter !== "undefined") {
    this.emitter = opts.emitter;
    requesting.push({
      value: this.emitter,
      type: "emitter"
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

  if (typeof opts.address !== "undefined") {
    this.address = opts.address;
    requesting.forEach(function(request) {
      request.address = this.address;
    }, this);
  }

  if (typeof opts.controller !== "undefined") {
    this.controller = opts.controller;
    requesting.forEach(function(request) {
      request.controller = this.controller;
    }, this);
  }

  if (typeof opts.bus !== "undefined") {
    this.bus = opts.bus;
    requesting.forEach(function(request) {
      request.bus = this.bus;
    }, this);
  }

  if (componentOpts.requestPin) {
    // With the pins being requested for use by this component,
    // compare with the list of pins that are already known to be
    // in use by other components. If any are known to be in use,
    // produce a warning for the user.
    requesting.forEach(function(request, index) {
      var hasController = typeof request.controller !== "undefined";
      var hasAddress = typeof request.address !== "undefined";
      var isOccupied = false;
      var message = "";

      request.value = originalPins[index];

      if (this.board.occupied.length) {
        isOccupied = this.board.occupied.some(function(occupied) {
          var isPinOccupied = request.value === occupied.value && request.type === occupied.type;

          if (typeof occupied.controller !== "undefined") {
            if (hasController) {
              return isPinOccupied && (request.controller === occupied.controller);
            }
            return false;
          }

          if (typeof occupied.address !== "undefined") {
            if (hasAddress) {
              return isPinOccupied && (request.address === occupied.address);
            }
            return false;
          }

          return isPinOccupied;
        });
      }

      if (isOccupied) {
        message = request.type + ": " + request.value;

        if (hasController) {
          message += ", controller: " + request.controller;
        }

        if (hasAddress) {
          message += ", address: " + request.address;
        }

        this.board.warn("Component", message + " is already in use");
      } else {
        this.board.occupied.push(request);
      }
    }, this);
  }

  this.board.register.push(this);
};

Board.Component.initialization = function(opts) {
  var defaults = {
    requestPin: true,
    normalizePin: true
  };

  return Object.assign({}, defaults, opts);
};


Board.Device = function(opts) {
  Board.Component.call(this, opts);
};

/**
 * Board.Controller
 *
 * Decorate a Component with a Controller. Must be called
 * _AFTER_ a Controller is identified.
 *
 * Board.Controller is a |this| sensitive constructor,
 * and must be called as:
 *
 * Board.Controller.call( this, controller, opts );
 *
 */

Board.Controller = function(controller, options) {
  var requirements = controller.requirements && controller.requirements.value;

  if (requirements) {
    if (requirements.options) {
      Object.keys(requirements.options).forEach(function(key) {
        /*
        requirements: {
          value: {
            options: {
              parameterName: {
                throws: false,
                message: "...blah blah blah",
                typeof: "number",
              }
            }
          }
        },
        */
        if (typeof options[key] === "undefined" ||
          typeof options[key] !== requirements.options[key].typeof) {
          if (requirements.options[key].throws) {
            throw new Error(requirements.options[key].message);
          } else {
            this.board.warn(this.constructor.name, requirements.options[key].message);
          }
        }
      }, this);
    }
  }

  Object.defineProperties(this, controller);
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
  Object.assign(this, opts);
};


/**
 * Boards or Board.Collection; Used when the program must connect to
 * more then one board.
 *
 * @memberof Board
 *
 * @param {Array} ports List of port objects { id: ..., port: ... }
 *                      List of id strings (initialized in order)
 *
 * @return {Boards} board object references
 */
function Boards(opts) {
  if (!(this instanceof Boards)) {
    return new Boards(opts);
  }

  var ports;

  // new Boards([ ...Array of board opts ])
  if (Array.isArray(opts)) {
    ports = opts.slice();
    opts = {
      ports: ports,
    };
  }

  // new Boards({ ports: [ ...Array of board opts ], .... })
  if (!Array.isArray(opts) && typeof opts === "object" && opts.ports !== undefined) {
    ports = opts.ports;
  }

  // new Boards(non-Array?)
  // new Boards({ ports: non-Array? })
  if (!Array.isArray(ports)) {
    throw new Error("Expected ports to be an array");
  }

  if (typeof opts.debug === "undefined") {
    opts.debug = true;
  }

  if (typeof opts.repl === "undefined") {
    opts.repl = true;
  }

  var initialized = {};
  var noRepl = ports.some(function(port) { return port.repl === false; });
  var noDebug = ports.some(function(port) { return port.debug === false; });

  this.length = ports.length;
  this.debug = opts.debug;
  this.repl = opts.repl;

  // If any of the port definitions have
  // explicitly shut off debug output, bubble up
  // to the Boards instance
  if (noDebug) {
    this.debug = false;
  }

  // If any of the port definitions have
  // explicitly shut off the repl, bubble up
  // to the Boards instance
  if (noRepl) {
    this.repl = false;
  }

  var expecteds = ports.map(function(port, index) {
    var portOpts;

    if (typeof port === "string") {
      portOpts = {
        id: port
      };
    } else {
      portOpts = port;
    }

    // Shut off per-board repl instance creation
    portOpts.repl = false;

    this[index] = initialized[portOpts.id] = new Board(portOpts);

    // "error" event is not async, register immediately
    this[index].on("error", function(error) {
      this.emit("error", error);
    }.bind(this));

    return new Promise(function(resolve) {
      this[index].on("ready", function() {
        resolve(initialized[portOpts.id]);
      });
    }.bind(this));
  }, this);

  Promise.all(expecteds).then(function(boards) {
    Object.assign(this, boards);

    this.each(function(board) {
      board.info("Board ID: ", chalk.green(board.id));
    });

    // If the Boards instance requires a REPL,
    // make sure it's created before calling "ready"
    if (this.repl) {
      this.repl = new Repl(
        Object.assign({}, initialized, {
          board: this
        })
      );
      this.repl.initialize(function() {
        this.emit("ready", initialized);
      }.bind(this));
    } else {
      // Otherwise, call ready immediately
      this.emit("ready", initialized);
    }
  }.bind(this));
}

util.inherits(Boards, Emitter);

Object.assign(Boards.prototype, Collection.prototype);

Boards.prototype.byId = function(id) {
  for (var i = 0; i < this.length; i++) {
    if (this[i].id === id) {
      return this[i];
    }
  }

  return null;
};

Boards.prototype.log = Board.prototype.log;

logging.specials.forEach(function(type) {
  Boards.prototype[type] = function() {
    var args = [].slice.call(arguments);
    args.unshift(type);

    this.log.apply(this, args);
  };
});


if (IS_TEST_MODE) {
  Board.Serial = Serial;

  Board.purge = function() {
    Board.Pins.normalize.clear();
    Repl.isActive = false;
    Repl.isBlocked = true;
    Repl.ref = null;
    boards.length = 0;
  };

  Board.testMode = function(state) {
    if (!arguments.length) {
      return IS_TEST_MODE;
    } else {
      IS_TEST_MODE = state;
    }
  };
}

// TODO: Eliminate .Array for 1.0.0
Board.Array = Boards;
Board.Collection = Boards;

module.exports = Board;

// References:
// http://arduino.cc/en/Main/arduinoBoardUno
