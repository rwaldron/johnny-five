var Board = require("./board"),
  events = require("events"),
  util = require("util");

var Devices, Change, Update;

// Event type alias map
var aliases = {
  down: ["down", "press", "tap", "impact", "hit"],
  up: ["up", "release"],
  hold: ["hold"]
};

// all private instances
var priv = new Map();

// hold time out for buttons.
var holdTimeout = new Map();

// keeps data between cycles and fires change event
// if data changes
var last = new Map();




/**
 * Wii
 * @constructor
 *
 * five.Wii({
 *   device: "RVL-004",
 *   holdtime: ms before firing a hold event on a button,
 *   freq: ms to throttle the read data loop
 *   threshold: difference of change to qualify for a change event
 *  });
 *
 * Available events:
 *    "data" - firehose.
 *    "down", "press", "tap", "impact", "hit" - button press
 *    "up", "release" - button release
 *    "hold" - button hold
 *
 * @param {Object} opts [description]
 *
 */

function Wii(opts) {
  /* istanbul ignore if */
  if (!(this instanceof Wii)) {
    return new Wii(opts);
  }

  Board.Component.call(this, opts);

  // Derive device definition from Devices
  var device = Devices[opts.device];
  var address = device.address;
  var bytes = device.bytes;
  var delay = device.delay;
  var data = device.data.bind(this);
  var setup = device.setup;
  var preread = device.preread;

  // Wii controller instance properties
  this.freq = opts.freq || 100;

  // Button instance properties
  this.holdtime = opts.holdtime || 500;
  this.threshold = opts.threshold || 10;

  // Initialize components
  device.initialize.call(this);

  // Set initial "last data" byte array
  last.set(this, [0, 0, 0, 0, 0, 0, 0]);

  // Set up I2C data connection
  this.io.i2cConfig(opts);

  // Iterate and write each set of setup instructions
  setup.forEach(function(bytes) {
    this.io.i2cWrite(address, bytes);
  }, this);

  // Unthrottled i2c read request loop
  setInterval(function() {

    // Send this command to get all sensor data and store into
    // the 6-byte register within Wii controller.
    // This must be execute before reading data from the Wii.

    // Iterate and write each set of setup instructions
    preread.forEach(function(bytes) {
      this.io.i2cWrite(address, bytes);
    }, this);


    // Request six bytes of data from the controller
    this.io.i2cReadOnce(address, bytes, data);

    // Use the high-frequency data read loop as the change event
    // emitting loop. This drastically improves change event
    // frequency and sensitivity
    //
    // Emit change events if any delta is greater than
    // the threshold

    // RVL-005 does not have a read method at this time.
    /* istanbul ignore else */
    if (typeof device.read !== "undefined") {
      device.read.call(this);
    }
  }.bind(this), delay || this.freq);

  // Throttled "read" event loop
  setInterval(function() {
    var event = new Board.Event({
      target: this
    });

    this.emit("data", event);

  }.bind(this), this.freq);
}

Wii.Components = {};

// A nunchuck button (c or z.)
Wii.Components.Button = function(which, controller) {
  /* istanbul ignore if */
  if (!(this instanceof Wii.Components.Button)) {
    return new Wii.Components.Button(which, controller);
  }

  // c or z.
  this.which = which;

  // reference to parent controller
  this.controller = controller;

  // Set initial values for state tracking
  var state = {
    isDown: false
  };
  priv.set(this, state);

  Object.defineProperties(this, {
    // is the button up (not pressed)?
    isUp: {
      get: function() {
        return !state.isDown;
      }
    },

    // is the button pressed?
    isDown: {
      get: function() {
        return state.isDown;
      }
    }
  });
};

Wii.Components.Joystick = function(controller) {
  /* istanbul ignore if */
  if (!(this instanceof Wii.Components.Joystick)) {
    return new Wii.Components.Joystick(controller);
  }

  this.controller = controller;

  var state, accessors;

  // Initialize empty state object
  state = {};

  // Initialize empty accessors object
  accessors = {};

  // Enumerate Joystick properties
  ["x", "y", "dx", "dy"].forEach(function(key) {

    state[key] = 0;

    // Define accessors for each property in Joystick list
    accessors[key] = {
      get: function() {
        return state[key];
      }
    };
  }, this);

  // Store private state cache
  priv.set(this, state);

  // Register newly defined accessors
  Object.defineProperties(this, accessors);
};

Wii.Components.Accelerometer = function(controller) {
  /* istanbul ignore if */
  if (!(this instanceof Wii.Components.Accelerometer)) {
    return new Wii.Components.Accelerometer(controller);
  }

  this.controller = controller;

  var state, accessors;

  // Initialize empty state object
  state = {};

  // Initialize empty accessors object
  accessors = {};

  // Enumerate Joystick properties
  ["x", "y", "z", "dx", "dy", "dz"].forEach(function(key) {

    state[key] = 0;

    // Define accessors for each property in Joystick list
    accessors[key] = {
      get: function() {
        return state[key];
      }
    };
  }, this);

  // Store private state cache
  priv.set(this, state);

  // Register newly defined accessors
  Object.defineProperties(this, accessors);
};

util.inherits(Wii, events.EventEmitter);
util.inherits(Wii.Components.Button, events.EventEmitter);
util.inherits(Wii.Components.Joystick, events.EventEmitter);
util.inherits(Wii.Components.Accelerometer, events.EventEmitter);


// Regular Wiimote driver bytes will be encoded 0x17

function decodeByte(x) {
  return (x ^ 0x17) + 0x17;
}

// Change handlers for disparate controller event types
//
// Note: Change.* methods are |this| sensitive,
// therefore, call sites must use:
//
//    Change.button.call( instance, data );
//
//    Change.component.call( instance, data );
//
//
Change = {

  // Fire a "down", "up" or "hold" (and aliases) event
  // for a button context
  button: function(key) {
    // |this| is button context set by calling as:
    // Change.button.call( button instance, event key );
    //

    // Enumerate all button event aliases,
    // fire matching types
    aliases[key].forEach(function(type) {
      var event = new Board.Event({
        // |this| value is a button instance
        target: this,
        type: type
      });

      // fire button event on the button itself
      this.emit(type, event);

      // fire button event on the controller
      this.controller.emit(type, event);
    }, this);
  },

  // Fire a "change" event on a component context
  component: function(coordinate) {
    // |this| is component context set by calling as:
    // Change.component.call( component instance, coordinate, val );
    //

    ["axischange", "change"].forEach(function(type) {
      var event;

      if (this._events && this._events[type]) {
        event = new Board.Event({
          // |this| value is a button instance
          target: this,
          type: type,
          axis: coordinate,
          // Check dx/dy/dz change to determine direction
          direction: this["d" + coordinate] < 0 ? -1 : 1
        });

        // Fire change event on actual component
        this.emit(type, event);

        // Fire change on controller
        this.controller.emit(type, event);
      }
    }, this);
  }
};

// Update handlers for disparate controller event types
//
// Note: Update.* methods are |this| sensitive,
// therefore, call sites must use:
//
//    Update.button.call( button instance, boolean down );
//
//    Update.component.call( component instance, coordinate, val );
//
//

Update = {
  // Set "down" state for button context.
  button: function(isDown) {
    // |this| is button context set by calling as:
    // Update.button.call( button instance, boolean down );
    //

    var state, isFireable;

    // Derive state from private cache
    state = priv.get(this);

    // if this is a state change, mark this
    // change as fireable.
    isFireable = false;

    if (isDown !== state.isDown) {
      isFireable = true;
    }

    state.isDown = isDown;

    if (isFireable) {
      // start hold timeout for broadcasting hold.
      holdTimeout.set(this, setTimeout(function() {
        if (state.isDown) {
          Change.button.call(this, "hold");
        }
      }.bind(this), this.controller.holdtime));

      Change.button.call(this, isDown ? "down" : "up");
    }
  },

  // Set "coordinate value" state for component context.
  component: function(coordinate, val) {
    // |this| is component context set by calling as:
    // Update.component.call( component instance, coordinate, val );
    //

    var state = priv.get(this);
    state["d" + coordinate] = val - state[coordinate];
    state[coordinate] = val;
  }
};


Devices = {

  // Nunchuk
  "RVL-004": {
    address: 0x52,
    bytes: 6,
    delay: 100,
    setup: [
      [0x40, 0x00]
    ],
    preread: [
      [0x00]
    ],
    // device.read.call(this);
    read: function() {
      var axes = ["x", "y", "z"];

      [
        this.joystick,
        this.accelerometer
      ].forEach(function(component) {
        axes.forEach(function(axis) {
          var delta = "d" + axis;
          if (typeof component[delta] !== "undefined") {
            if (Math.abs(component[delta]) > this.threshold) {
              Change.component.call(component, axis);
            }
          }
        }, this);
      }, this);
    },
    // Call as:
    // device.initialize.call(this);
    initialize: function() {
      this.joystick = new Wii.Components.Joystick(this);
      this.accelerometer = new Wii.Components.Accelerometer(this);
      this.c = new Wii.Components.Button("c", this);
      this.z = new Wii.Components.Button("z", this);
    },
    data: function(data) {
      // TODO: Shift state management to weakmap, this
      //       should only update an entry in the map
      //

      if (data[0] !== 254 && data[1] !== 254 && data[2] !== 254) {

        // Byte 0x00 :  X-axis data of the joystick
        Update.component.call(
          this.joystick,
          "x", decodeByte(data[0]) << 2
        );

        // Byte 0x01 :  Y-axis data of the joystick
        Update.component.call(
          this.joystick,
          "y", decodeByte(data[1]) << 2
        );

        // Byte 0x02 :  X-axis data of the accellerometer sensor
        Update.component.call(
          this.accelerometer,
          "x", decodeByte(data[2]) << 2
        );

        // Byte 0x03 :  Y-axis data of the accellerometer sensor
        Update.component.call(
          this.accelerometer,
          "y", decodeByte(data[3]) << 2
        );

        // Byte 0x04 :  Z-axis data of the accellerometer sensor
        Update.component.call(
          this.accelerometer,
          "z", decodeByte(data[4]) << 2
        );

        // Update Z button
        // Grab the first bit of the sixth byte
        Update.button.call(
          this.z, (decodeByte(data[5]) & 0x01) === 0
        );

        // Update C button
        // Grab the second bit of the sixth byte
        Update.button.call(
          this.c, (decodeByte(data[5]) & 0x02) === 0
        );

        // Update last data array cache
        last.set(this, data);
      }
    }
  },

  // Classic Controller
  "RVL-005": {
    address: 0x52,
    bytes: 6,
    delay: 100,
    setup: [
      [0x40, 0x00]
    ],
    preread: [
      [0x00]
    ],

    // read: function( this ) {
    //   var axes = [ "x", "y", "z" ];

    //   [ this.joystick.left, this.joystick.right ].forEach(function( component ) {
    //     axes.forEach( function( axis ) {
    //       var delta = "d" + axis;
    //       if ( typeof component[ delta ] !== "undefined" ) {
    //         if ( Math.abs( component[ delta ] ) > this.threshold ) {
    //           Change.component.call( component, axis );
    //         }
    //       }
    //     }, this );
    //   }, this );
    // },
    initialize: function() {

      this.joystick = {
        left: new Wii.Components.Joystick(this),
        right: new Wii.Components.Joystick(this)
      };

      // obj.direction_pad = new Wii.DirectionPad( obj );
      [
        "y", "x", "up", "down", "left", "right",
        "a", "b", "l", "r", "zl", "zr", "start", "home", "select"
      ].forEach(function(id) {

        this[id] = new Wii.Components.Button(id, this);

      }, this);
    },
    data: function(data) {
      // TODO: Shift state management to weakmap, this
      //       should only update an entry in the map
      if (data[0] !== 254 && data[1] !== 254 && data[2] !== 254) {

        // LEFT/RIGHT
        Update.button.call(
          this.l, (decodeByte(data[4]) & 0x20) === 0
        );

        Update.button.call(
          this.r, (decodeByte(data[4]) & 0x02) === 0
        );

        // Direction
        Update.button.call(
          this.up, (decodeByte(data[5]) & 0x01) === 0
        );

        Update.button.call(
          this.left, (decodeByte(data[5]) & 0x02) === 0
        );

        Update.button.call(
          this.down, (decodeByte(data[4]) & 0x40) === 0
        );

        Update.button.call(
          this.right, (decodeByte(data[4]) & 0x80) === 0
        );

        // Z*
        Update.button.call(
          this.zr, (decodeByte(data[5]) & 0x04) === 0
        );

        Update.button.call(
          this.zl, (decodeByte(data[5]) & 0x80) === 0
        );

        // X/Y
        Update.button.call(
          this.x, (decodeByte(data[5]) & 0x08) === 0
        );

        Update.button.call(
          this.y, (decodeByte(data[5]) & 0x20) === 0
        );

        // A/B
        Update.button.call(
          this.a, (decodeByte(data[5]) & 0x10) === 0
        );

        Update.button.call(
          this.b, (decodeByte(data[5]) & 0x40) === 0
        );

        // MENU
        Update.button.call(
          this.select, (decodeByte(data[4]) & 0x10) === 0
        );

        Update.button.call(
          this.start, (decodeByte(data[4]) & 0x04) === 0
        );

        Update.button.call(
          this.home, (decodeByte(data[4]) & 0x08) === 0
        );


        Update.component.call(
          this.joystick.left,
          "x", decodeByte(data[0]) & 0x3f
        );

        // Byte 0x01 :  Y-axis data of the joystick
        Update.component.call(
          this.joystick.left,
          "y", decodeByte(data[0]) & 0x3f
        );

        Update.component.call(
          this.joystick.right,
          "x", ((data[0] & 0xc0) >> 3) + ((data[1] & 0xc0) >> 5) + ((data[2] & 0x80) >> 7)
        );

        Update.component.call(
          this.joystick.right,
          "y", data[2] & 0x1f
        );

        // Update last data array cache
        last.set(this, data);
      }
    }
  }
};


Wii.Nunchuk = function(opts) {
  opts = opts || {};
  opts.device = "RVL-004";

  return new Wii(opts);
};

Wii.Classic = function(opts) {
  opts = opts || {};
  opts.device = "RVL-005";

  return new Wii(opts);
};

module.exports = Wii;
