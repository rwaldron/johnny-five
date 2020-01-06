const Emitter = require("events");
const chalk = require("chalk");
const Collection = require("./mixins/collection");
const Fn = require("./fn");
const Repl = require("./repl");
const Options = require("./board.options");
const Pins = require("./board.pins");
// This may get overridden by the tests
let IS_TEST_MODE = !!process.env.IS_TEST_MODE;
let Expander;
//const temporal = require("temporal");

// Environment Setup
const boards = [];
const rport = /usb|acm|^com/i;

// const things to const when 0.10.x is dropped
// This string appears over 20 times in this file.
const UNDEFINED = "undefined";

const Serial = {
  used: [],
  attempts: [],
  detect(callback) {
    // Max number of times listing serial conntections can fail
    const maxAttempts = 10;
    // Delay (ms) before trying again to list serial connections
    const retryDelay = 400;
    let serialport;

    /* istanbul ignore next */
    if (parseFloat(process.versions.nw) >= 0.13) {
      serialport = require("browser-serialport");
    } else {
      serialport = require("serialport");
    }

    // console.log(require);
    // Request a list of available ports, from
    // the result set, filter for valid paths
    // via known path pattern match.
    serialport.list().then(results => {
      const portPaths = results.reduce((accum, result) => {
        let available = true;

        // Match only portPaths that Arduino cares about
        // ttyUSB#, cu.usbmodem#, COM#
        if (!rport.test(result.path)) {
          available = false;
        }

        // Don't allow already used/encountered usb device paths
        if (Serial.used.includes(result.path)) {
          available = false;
        }

        if (available) {
          accum.push(result.path);
        }

        return accum;
      }, []);

      // If no portPaths are detected...
      if (!portPaths.length) {

        /* istanbul ignore if */
        if (IS_TEST_MODE && this.abort) {
          /* istanbul ignore next */
          return;
        }

        // Create an attempt counter
        /* istanbul ignore else */
        if (!Serial.attempts[Serial.used.length]) {
          Serial.attempts[Serial.used.length] = 0;

          // Log notification...
          this.info("Board", "Looking for connected device");
        }

        // Set the attempt number
        Serial.attempts[Serial.used.length]++;

        // Retry Serial connection
        if (Serial.attempts[Serial.used.length] > maxAttempts) {
          this.fail("Board", "No connected device found");
          return;
        }
        setTimeout(() => {
          Serial.detect.call(this, callback);
        }, retryDelay);

        return;
      }

      this.info("Available", chalk.grey(portPaths));

      // Get the first available device path
      // from the list of detected portPaths

      callback.call(this, portPaths[0]);
    });
  },

  connect(portOrPath, callback) {
    const IO = require("firmata").Board;

    let caught = null;
    let io;
    let isConnected;
    let path;
    let type;

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
      io = new IO(portOrPath, error => {
        if (error) {
          caught = error;
        }

        callback.call(this, caught, caught ? "error" : "ready", io);
      });

      // Extend io instance with special expandos used
      // by Johny-Five for the IO Plugin system.
      io.name = "Firmata";
      io.defaultLed = 13;
      io.port = path;

      // Made this far, safely connected
      isConnected = true;
    } catch (error) {
      caught = error;
    }

    if (caught) {
      caught = caught.message || caught;
    }

    // Determine the type of event that will be passed on to
    // the board emitter in the callback passed to Serial.detect(...)
    type = isConnected ? "connect" : "error";

    // Execute "connect" callback
    callback.call(this, caught, type, io);
  }
};

/**
 * Board
 * @constructor
 *
 * @param {Object} options
 */

class Board extends Emitter {
  constructor(options = {}) {
    super();

    // Used to define the board instance's own
    // properties in the REPL's scope.
    const replContext = {};

    // It's feasible that an IO-Plugin may emit
    // "connect" and "ready" events out of order.
    // This is used to enforce the order, by
    // postponing the "ready" event if the IO-Plugin
    // hasn't emitted a "connect" event. Once
    // the "connect" event is emitted, the
    // postponement is lifted and the board may
    // proceed with emitting the events in the
    // correct order.
    let isPostponed = false;

    // Initialize this Board instance with
    // param specified properties.
    Object.assign(this, options);

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
    if (typeof this.debug === UNDEFINED) {
      this.debug = true;
    }

    // If no repl flag, default to true
    if (typeof this.repl === UNDEFINED) {
      this.repl = true;
    }

    // If no sigint flag, default to true
    if (typeof this.sigint === UNDEFINED) {
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
    /* istanbul ignore if */
    if (this.repl) {
      /* istanbul ignore if */
      if (Repl.ref) {
        /* istanbul ignore next */
        replContext[this.id] = this;
        /* istanbul ignore next */
        Repl.ref.on("ready", function() {
          /* istanbul ignore next */
          Repl.ref.inject(replContext);
        });
        /* istanbul ignore next */
        this.repl = Repl.ref;
      } else {
        replContext[this.id] = replContext.board = this;
        this.repl = new Repl(replContext);
      }
    }

    if (options.io) {
      // If you already have a connected io instance
      this.io = options.io;
      this.isReady = options.io.isReady;
      this.transport = this.io.transport || null;
      this.port = this.io.name;
      this.pins = Board.Pins(this);
      this.RESOLUTION = Object.assign({ ADC: 1023, DAC: null, PWM: 255 }, this.io.RESOLUTION || {});

    } else {

      if (this.port && options.port) {
        Serial.connect.call(this, this.port, finalizeAndBroadcast);
      } else {
        Serial.detect.call(this, function(path) {
          Serial.connect.call(this, path, finalizeAndBroadcast);
        });
      }
    }

    // Either an IO instance was provided or isOnBoard is true
    if (!options.port && this.io !== null) {
      /* istanbul ignore next */
      this.info("Available", chalk.grey(this.io.name || "unknown"));

      ["connect", "ready"].forEach((type) => {
        this.io.once(type, () => {
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
        });

        if (this.io.isReady) {
          // If the IO instance is reached "ready"
          // state, queue tick tasks to emit the
          // "connect" and "ready" events
          process.nextTick(() => this.io.emit(type));
        }
      });
    }

    this.once("ready", () => {
      const hrstart = process.hrtime();

      this.millis = function() {
        const now = process.hrtime(hrstart);
        return (now[1] / 1000000);
      };

      ["close", "disconnect", "error", "string"].forEach(type => {
        this.io.on(type, data => this.emit(type, data));
      });
    });

    // Cache instance to allow access from module constructors
    boards.push(this);
  }
}

function finalizeAndBroadcast(data, type, io) {
  let hasBeenEmitted = false;

  // Assign found io to instance
  if (!this.io) {
    this.io = io;
  }

  // Always Surface errors
  if (type === "error") {
    /* istanbul ignore else */
    if (data && data.message) {
      hasBeenEmitted = true;
      this.error("Error", data.message);
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
      /* istanbul ignore next */
      this.timer = setTimeout(() => {
        this.error(
          "Device or Firmware Error",

          "A timeout occurred while connecting to the Board. \n\n" +
          "Please check that you've properly flashed the board with the correct firmware.\n" +
          "See: https://github.com/rwaldron/johnny-five/wiki/Getting-Started#trouble-shooting\n\n" +
          "If connecting to a Leonardo or Leonardo clone, press the 'Reset' button on the " +
          "board, wait approximately 11 seconds for complete reset, then run your program again."
        );

        this.emit("error", new Error("A timeout occurred while connecting to the Board."));
      }, this.timeout || 1e4);
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

    if (typeof io.debug !== UNDEFINED &&
        io.debug === false) {
      this.debug = false;
    }

    if (typeof io.repl !== UNDEFINED &&
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
      this.repl.initialize(() => this.emit("ready"));
    }

    if (io.name !== "Mock" && this.sigint) {
      process.on("SIGINT", () => {
        // Time to wait before forcing exit
        const failExitTimeout = 1000;

        this.emit("exit");
        this.warn("Board", "Closing.");
        /* istanbul ignore next */
        const timeout = setTimeout(() => {
          process.reallyExit();
        }, failExitTimeout);
        const interval = setInterval(() => {
          if (!this.io.pending) {
            clearInterval(interval);
            clearTimeout(timeout);
            process.nextTick(process.reallyExit);
          }
        }, 1);
      });
    }

    // Older versions of Firmata and some IO plugins
    // may not have set RESOLUTION.
    this.RESOLUTION = Object.assign({ ADC: 1023, DAC: null, PWM: 255 }, io.RESOLUTION || {});

  }

  // If there is a REPL...
  if (this.repl) {
    // "ready" will be emitted once repl.initialize
    // is complete, so the only event that needs to
    // be propagated here is the "connect" event.
    if (type === "connect") {
      this.emit(type, data);
    }
  } else {
    // The REPL is disabled, propagate all events
    if (!hasBeenEmitted) {
      this.emit(type, data);
    }
  }
}

// Inherit event api
// util.inherits(Board, Emitter);



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
  /* istanbul ignore next */
  Board.prototype[method] = function() {
    this.io[method].apply(this.io, arguments);
    return this;
  };
});


Board.prototype.snapshot = function(reducer) {
  const blacklist = this.snapshot.blacklist;
  const special = this.snapshot.special;
  const hasReducer = typeof reducer === "function";

  return this.register.reduce((cAccum, component) => {
    // Don't include collections or multi/imu wrappers
    if (typeof component.components === UNDEFINED) {
      cAccum.push(
        Object.getOwnPropertyNames(component).reduce((pAccum, prop) => {
          const value = component[prop];

          if (!blacklist.includes(prop) && typeof value !== "function") {

            if (hasReducer) {
              const result = reducer(prop, value, component);

              if (result !== undefined) {
                pAccum[prop] = result;
              }
            } else {
              pAccum[prop] = special[prop] ?
                special[prop](value) : value;
            }
          }
          return pAccum;
        }, Object.create(null))
      );
    }

    return cAccum;
  }, []);
};

Board.prototype.serialize = function(reducer) {
  return JSON.stringify(this.snapshot(reducer));
};

Board.prototype.snapshot.blacklist = [
  "board", "io", "_events", "_eventsCount", "state",
];

Board.prototype.samplingInterval = function(ms) {

  if (this.io.setSamplingInterval) {
    this.io.setSamplingInterval(ms);
  } else {
    throw new Error("This IO plugin does not implement an interval adjustment method");
  }
  return this;
};


Board.prototype.snapshot.special = {
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

  for (let i = 0; i < 8; i++) {
    this.io.digitalWrite(clockPin, 0);
    if (isBigEndian) {
      this.io.digitalWrite(dataPin, !!(value & (1 << (7 - i))) | 0);
    } else {
      this.io.digitalWrite(dataPin, !!(value & (1 << i)) | 0);
    }
    this.io.digitalWrite(clockPin, 1);
  }
};

const logging = {
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
  var args = Array.from(arguments);

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

  /* istanbul ignore if */
  if (this.debug) {
    /* istanbul ignore next */
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
  if (typeof index === "number") {
    hardware = boards[index];
    return hardware ? hardware : null;
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
  if (typeof opts === UNDEFINED) {
    opts = {};
  }

  if (typeof componentOpts === UNDEFINED) {
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

  if (opts.controller) {

    if (typeof opts.controller === "string") {
      opts.controller = opts.controller.replace(/-/g, "");
    }

    if (!Expander) {
      Expander = require("./expander");
    }

    if (Expander.hasController(opts.controller)) {
      componentOpts = {
        normalizePin: false,
        requestPin: false,
      };
    }
  }

  componentOpts = Board.Component.initialization(componentOpts);

  if (componentOpts.normalizePin) {
    opts = Board.Pins.normalize(opts, this.board);
  }

  if (typeof opts.pins !== UNDEFINED) {
    this.pins = opts.pins || [];
  }

  if (typeof opts.pin !== UNDEFINED) {
    this.pin = opts.pin;
  }

  // TODO: Figure out what is using this
  /* istanbul ignore if */
  if (typeof opts.emitter !== UNDEFINED) {
    /* istanbul ignore next */
    this.emitter = opts.emitter;
  }

  if (typeof opts.address !== UNDEFINED) {
    this.address = opts.address;
  }

  if (typeof opts.controller !== UNDEFINED) {
    this.controller = opts.controller;
  }

  // TODO: Figure out what is using this
  /* istanbul ignore if */
  if (typeof opts.bus !== UNDEFINED) {
    /* istanbul ignore next */
    this.bus = opts.bus;
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

Board.Controller = function(controllers, options) {

  let controller;

  if (typeof options.controller === "string") {
    controller = controllers[options.controller] || controllers[options.controller.toUpperCase()];
  } else {
    controller = options.controller || controllers.DEFAULT || null;
  }

  if (controller === null) {
    throw new Error("No Valid Controller Found");
  }

  let requirements = controller.requirements && controller.requirements.value;

  if (requirements) {
    /* istanbul ignore else */
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
        if (typeof options[key] === UNDEFINED ||
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
Board.Options = function(options) {
  return new Options(options);
};

// Define a user-safe, unwritable hardware cache access

Object.defineProperty(Board, "cache", {
  get() {
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
Board.Event = function(event) {

  if (typeof event === UNDEFINED) {
    throw new Error("Board.Event missing Event object");
  }

  // default event is read
  this.type = event.type || "data";

  // actual target instance
  this.target = event.target || null;

  // Initialize this Board instance with
  // param specified properties.
  Object.assign(this, event);
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
class Boards extends Collection {
  constructor(options) {
    let ports;

    // new Boards([ ...Array of board options ])
    if (Array.isArray(options)) {
      ports = options.slice();
      options = {
        ports,
      };
    }

    // new Boards({ ports: [ ...Array of board options ], .... })
    /* istanbul ignore else */
    if (!Array.isArray(options) && typeof options === "object" && options.ports !== undefined) {
      ports = options.ports;
    }

    // new Boards(non-Array?)
    // new Boards({ ports: non-Array? })
    /* istanbul ignore if */
    if (!Array.isArray(ports)) {
      throw new Error("Expected ports to be an array");
    }

    if (typeof options.debug === UNDEFINED) {
      options.debug = true;
    }

    if (typeof options.repl === UNDEFINED) {
      options.repl = true;
    }

    const initialized = {};
    const noRepl = ports.some(({repl}) => repl === false);
    const noDebug = ports.some(({debug}) => debug === false);
    const boardObjects = ports.map((port) => {
      let portOpts;

      if (typeof port === "string") {
        portOpts = {};

        // If the string matches a known valid port
        // name pattern, then assume this is what
        // the user code intended.
        if (rport.test(port)) {
          portOpts.port = port;
        } else {
          // Otherwise they expect Johnny-Five to figure
          // out what ports to use and intended this
          // value to be used an id
          portOpts.id = port;
        }
      } else {
        portOpts = port;
      }

      // Shut off per-board repl instance creation
      portOpts.repl = false;

      return new Board(portOpts);
    });

    super(boardObjects);

    // Set the base values from the options object.
    this.debug = options.debug;
    this.repl = options.repl;

    // Figure out board specific overrides...
    //
    // If any of the port definitions have
    // explicitly shut off debug output, bubble up
    // to the Boards instance
    /* istanbul ignore else */
    if (noDebug) {
      this.debug = false;
    }

    // If any of the port definitions have
    // explicitly shut off the repl, bubble up
    // to the Boards instance
    /* istanbul ignore else */
    if (noRepl) {
      this.repl = false;
    }

    const expecteds = this.map((board, index) => {
      initialized[board.id] = board;
      return new Promise((resolve) => {
        this[index].on("error", error => this.emit("error", error));
        this[index].on("fail", event => this.emit("fail", event));
        this[index].on("ready", () => resolve(this[index]));
      });
    });

    Promise.all(expecteds).then((/* boards */) => {
      this.each(board => {
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
        this.repl.initialize(() => this.emit("ready", initialized));
      } else {
        // Otherwise, call ready immediately
        this.emit("ready", initialized);
      }
    }).catch(error => {
      console.error(chalk.red(error));
    });
  }

  static get type() {
    return Board;
  }
}

Collection.installMethodForwarding(
  Boards.prototype, Board.prototype
);

Object.assign(
  Boards.prototype,
  Emitter.prototype
);

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
  /* istanbul ignore next */
  Boards.prototype[type] = function() {
    var args = [].slice.call(arguments);
    args.unshift(type);

    this.log.apply(this, args);
  };
});

/* istanbul ignore else */
if (IS_TEST_MODE) {
  Serial.purge = function() {
    Serial.used.length = 0;
  };
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
