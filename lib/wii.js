var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    __ = require("../lib/fn.js");

var DEBUG = true;

var Devices, aliases, priv, holdTimeout, last,
    Change, Update;

// Event type alias map
aliases = {
  down: [ "down", "press", "tap", "impact", "hit" ],
  up: [ "up", "release" ],
  hold: [ "hold" ]
};

// all private instances
priv = new WeakMap();

// hold time out for buttons.
holdTimeout = new WeakMap();

// keeps data between cycles and fires change event
// if data changes
last = new WeakMap();




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
 *    "read" - firehose.
 *    "down", "press", "tap", "impact", "hit" - button press
 *    "up", "release" - button release
 *    "hold" - button hold
 *
 * @param {Object} opts [description]
 *
 */
function Wii( opts ) {

  if ( !(this instanceof Wii) ) {
    return new Wii( opts );
  }

  var address, bytes, data, device,
      delay, setup, preread;

  // Initialize Hardware instance properties
  Board.Device.call( this, opts );

  // Derive device definition from Devices
  device = Devices[ opts.device ];

  address = device.address;
  bytes = device.bytes;
  delay = device.delay;
  data = device.data;
  setup = device.setup;
  preread = device.preread;

  // Wii controller instance properties
  this.freq = opts.freq || 500;

  // Button instance properties
  this.holdtime = opts && opts.holdtime || 500;
  this.threshold = opts && opts.threshold || 10;

  // Initialize components
  device.initialize.call( this );

  // Set initial "last data" byte array
  last.set( this, [ 0, 0, 0, 0, 0, 0, 0 ] );

  // Set up I2C data connection
  this.firmata.sendI2CConfig();

  // Iterate and write each set of setup instructions
  setup.forEach(function( bytes ) {
    this.firmata.sendI2CWriteRequest( address, bytes );
  }, this);

  // Unthrottled i2c read request loop
  setInterval(function() {

    // Send this command to get all sensor data and store into
    // the 6-byte register within Wii controller.
    // This must be execute before reading data from the Wii.

    // Iterate and write each set of setup instructions
    preread.forEach(function( bytes ) {
      this.firmata.sendI2CWriteRequest( address, bytes );
    }, this);


    // Request six bytes of data from the controller
    this.firmata.sendI2CReadRequest( address, bytes, data.bind(this) );

    // Use the high-frequency data read loop as the change event
    // emitting loop. This drastically improves change event
    // frequency and sensitivity
    //
    // Emit change events if any delta is greater than
    // the threshold

    // RVL-005 does not have a read method at this time.
    if ( typeof device.read !== "undefined" ) {
      device.read.call( this );
    }
  }.bind(this), delay || this.freq );

  // Throttled "read" event loop
  setInterval(function() {
    var event = Board.Event({
      target: this
    });

    // @DEPRECATE
    this.emit( "read", null, event );
    // The "read" event has been deprecated in
    // favor of a "data" event.
    this.emit( "data", null, event );

  }.bind(this), this.freq );
}

Wii.Components = {};

// A nunchuck button (c or z.)
Wii.Components.Button = function( which, controller ) {

  if ( !(this instanceof Wii.Components.Button) ) {
    return new Wii.Components.Button( which, controller );
  }

  // c or z.
  this.which = which;

  // reference to parent controller
  this.controller = controller;

  // Set initial values for state tracking
  priv.set( this, {
    isDown: false
  });

  Object.defineProperties( this, {
    // is the button up (not pressed)?
    isUp: {
      get: function() {
        return !priv.get(this).isDown;
      }
    },

    // is the button pressed?
    isDown: {
      get: function() {
        return priv.get(this).isDown;
      }
    }
  });
};

Wii.Components.Joystick = function( controller ) {

  if ( !(this instanceof Wii.Components.Joystick) ) {
    return new Wii.Components.Joystick( controller );
  }

  this.controller = controller;

  var state, accessors;

  // Initialize empty state object
  state = {};

  // Initialize empty accessors object
  accessors = {};

  // Enumerate Joystick properties
  [ "x", "y", "dx", "dy" ].forEach(function( key ) {

    state[ key ] = 0;

    // Define accessors for each property in Joystick list
    accessors[ key ] = {
      get: function() {
        return priv.get( this )[ key ];
      }
    };
  }, this);

  // Store private state cache
  priv.set( this, state );

  // Register newly defined accessors
  Object.defineProperties( this, accessors );
};

Wii.Components.Accelerometer = function( controller ) {

  if ( !(this instanceof Wii.Components.Accelerometer) ) {
    return new Wii.Components.Accelerometer( controller );
  }

  this.controller = controller;

  var state, accessors;

  // Initialize empty state object
  state = {};

  // Initialize empty accessors object
  accessors = {};

  // Enumerate Joystick properties
  [ "x", "y", "z", "dx", "dy", "dz" ].forEach(function( key ) {

    state[ key ] = 0;

    // Define accessors for each property in Joystick list
    accessors[ key ] = {
      get: function() {
        return priv.get( this )[ key ];
      }
    };
  }, this);

  // Store private state cache
  priv.set( this, state );

  // Register newly defined accessors
  Object.defineProperties( this, accessors );
};

util.inherits( Wii, events.EventEmitter );
util.inherits( Wii.Components.Button, events.EventEmitter );
util.inherits( Wii.Components.Joystick, events.EventEmitter );
util.inherits( Wii.Components.Accelerometer, events.EventEmitter );


// Regular Wiimote driver bytes will be encoded 0x17
function decodeByte( x ) {
  return ( x ^ 0x17 ) + 0x17;
}

function pressedRowBit( row, bit ) {
  return !row && ( 1 << bit );
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
  button: function( key ) {
    // |this| is button context set by calling as:
    // Change.button.call( button instance, event key );
    //

    // Enumerate all button event aliases,
    // fire matching types
    aliases[ key ].forEach(function( type ) {
      var event = new Board.Event({
        // |this| value is a button instance
        target: this,
        type: type
      });

      // fire button event on the button itself
      this.emit( type, null, event );

      // fire button event on the controller
      this.controller.emit( type, null, event );
    }, this);
  },

  // Fire a "change" event on a component context
  component: function( coordinate ) {
    // |this| is component context set by calling as:
    // Change.component.call( component instance, coordinate, val );
    //

    [ "axischange", "change" ].forEach(function( type ) {
      var event;

      if ( this._events[ type ] ) {
        event = new Board.Event({
          // |this| value is a button instance
          target: this,
          type: type,
          axis: coordinate,
          // Check dx/dy/dz change to determine direction
          direction: this[ "d" + coordinate ] < 0 ? -1 : 1
        });

        // Fire change event on actual component
        this.emit( type, null, event );

        // Fire change on controller
        this.controller.emit( type, null, event );
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
  button: function( isDown ) {
    // |this| is button context set by calling as:
    // Update.button.call( button instance, boolean down );
    //

    var state, isFireable;

    // Derive state from private cache
    state = priv.get( this );

    // if this is a state change, mark this
    // change as fireable.
    isFireable = false;

    if ( isDown !== state.isDown ) {
      isFireable = true;
    }

    state.isDown = isDown;

    priv.set( this, state );

    if ( isFireable ) {
      // start hold timeout for broadcasting hold.
      holdTimeout.set( this, setTimeout(function() {
        if ( state.isDown ) {
          Change.button.call( this, "hold" );
        }
      }.bind(this), this.controller.holdtime ));

      Change.button.call( this, isDown ? "down" : "up" );
    }
  },

  // Set "coordinate value" state for component context.
  component: function( coordinate, val ) {
    // |this| is component context set by calling as:
    // Update.component.call( component instance, coordinate, val );
    //

    var state = priv.get( this );
    state[ "d" + coordinate ] = val - state[ coordinate ];
    state[ coordinate ] = val;
    priv.set( this, state );
  }
};


Devices = {

  // Nunchuk
  "RVL-004": {
    address: 0x52,
    bytes: 6,
    delay: 100,
    setup: [
      [ 0x40, 0x00 ]
    ],
    preread: [
      [ 0x00 ]
    ],
    // device.read.call(this);
    read: function() {
      var axes = [ "x", "y", "z" ];

      [
        this.joystick,
        this.accelerometer
      ].forEach(function( component ) {
        axes.forEach( function( axis ) {
          var delta = "d" + axis;
          if ( typeof component[ delta ] !== "undefined" ) {
            if ( Math.abs( component[ delta ] ) > this.threshold ) {
              Change.component.call( component, axis );
            }
          }
        }, this );
      }, this );
    },
    // Call as:
    // device.initialize.call(this);
    initialize: function() {
      this.joystick = new Wii.Components.Joystick( this );
      this.accelerometer = new Wii.Components.Accelerometer( this );
      this.c = new Wii.Components.Button( "c", this );
      this.z = new Wii.Components.Button( "z", this );
    },
    data: function( data ) {
      // TODO: Shift state management to weakmap, this
      //       should only update an entry in the map
      //

      if ( data[0] !== 254 && data[1] !== 254 && data[2] !== 254 ) {

        // Byte 0x00 :  X-axis data of the joystick
        Update.component.call(
          this.joystick,
          "x", decodeByte( data[0] ) << 2
        );

        // Byte 0x01 :  Y-axis data of the joystick
        Update.component.call(
          this.joystick,
          "y", decodeByte( data[1] ) << 2
        );

        // Byte 0x02 :  X-axis data of the accellerometer sensor
        Update.component.call(
          this.accelerometer,
          "x", decodeByte( data[2] ) << 2
        );

        // Byte 0x03 :  Y-axis data of the accellerometer sensor
        Update.component.call(
          this.accelerometer,
          "y", decodeByte( data[3] ) << 2
        );

        // Byte 0x04 :  Z-axis data of the accellerometer sensor
        Update.component.call(
          this.accelerometer,
          "z", decodeByte( data[4] ) << 2
        );

        // Update Z button
        // Grab the first byte of the sixth bit
        Update.button.call(
          this.z,
          ( decodeByte( data[5] ) & 0x01 ) === 0 ? true : false
        );

        // Update C button
        // Grab the second byte of the sixth bit
        Update.button.call(
          this.c,
          ( decodeByte( data[5] ) & 0x02 ) === 0 ? true : false
        );

        // Update last data array cache
        last.set( this, data );
      }
    }
  },

  // Classic Controller
  "RVL-005": {
    address: 0x52,
    bytes: 6,
    delay: 100,
    setup: [
      [ 0x40, 0x00 ]
    ],
    preread: [
      [ 0x00 ]
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
        left: new Wii.Components.Joystick( this ),
        right: new Wii.Components.Joystick( this )
      };

      // obj.direction_pad = new Wii.DirectionPad( obj );
      [
        "y", "x", "up", "down", "left", "right",
        "a", "b", "l", "r", "zl", "zr", "start", "home", "select"
      ].forEach(function( id ) {

        this[ id ] = new Wii.Components.Button( id, this );

      }, this);
    },
    data: function( data ) {
      // TODO: Shift state management to weakmap, this
      //       should only update an entry in the map
      //
      // console.log("data read");
      if ( data[0] !== 254 && data[1] !== 254 && data[2] !== 254 ) {
        // Update.button.call(
        //   this.l,
        //   ( decodeByte( data[4] ) & 0x05 ) === 0 ? true : false
        // );
        // console.log("L:"+( decodeByte( data[4] ) & (1 << 5) ) === 0 ? true : false);

        // LEFT/RIGHT
        Update.button.call(
          this.l,
          ( decodeByte( data[4] ) & 0x20 ) === 0 ? true : false
        );

        Update.button.call(
          this.r,
          ( decodeByte( data[4] ) & 0x02 ) === 0 ? true : false
        );

        // Direction
        Update.button.call(
          this.up,
          ( decodeByte( data[5] ) & 0x01 ) === 0 ? true : false
        );

        Update.button.call(
          this.left,
          ( decodeByte( data[5] ) & 0x02 ) === 0 ? true : false
        );

        Update.button.call(
          this.down,
          ( decodeByte( data[4] ) & 0x40 ) === 0 ? true : false
        );

        Update.button.call(
          this.right,
          ( decodeByte( data[4] ) & 0x80 ) === 0 ? true : false
        );

        // Z*
        Update.button.call(
          this.zr,
          ( decodeByte( data[5] ) & 0x04 ) === 0 ? true : false
        );

        Update.button.call(
          this.zl,
          ( decodeByte( data[5] ) & 0x80 ) === 0 ? true : false
        );

        // X/Y
        Update.button.call(
          this.x,
          ( decodeByte( data[5] ) & 0x08 ) === 0 ? true : false
        );

        Update.button.call(
          this.y,
          ( decodeByte( data[5] ) & 0x20 ) === 0 ? true : false
        );

        // A/B
        Update.button.call(
          this.a,
          ( decodeByte( data[5] ) & 0x10 ) === 0 ? true : false
        );

        Update.button.call(
          this.b,
          ( decodeByte( data[5] ) & 0x40 ) === 0 ? true : false
        );

        // MENU
        Update.button.call(
          this.select,
          ( decodeByte( data[4] ) & 0x10 ) === 0 ? true : false
        );

        Update.button.call(
          this.start,
          ( decodeByte( data[4] ) & 0x04 ) === 0 ? true : false
        );

        Update.button.call(
          this.home,
          ( decodeByte( data[4] ) & 0x08 ) === 0 ? true : false
        );


        /// debugger to parse out keycodes.
        if (DEBUG) {

          // var leftX = ( decodeByte( data[1] ) & 0x0f );
          // var leftX = ( decodeByte( data[1] ) & 0x0f );
          // console.log("--------------------");
          // console.log(data.join(","));
          // console.log("--------------------");
          // for (var b = 3; b < 6; b++) {
          //   for (var c = 0; c <= 255; c++) {
          //     var t = ( decodeByte( data[b] ) & c ) === 0 ? true : false;
          //     if (t)
          //       console.log(b+">"+c+":");
          //   }
          // }
          // console.log("--------------------");
          // ( pressedRowBit( decodeByte( data[0] ), 5 ));
        }

        Update.component.call(
          this.joystick.left,
          "x", decodeByte( data[0] ) & 0x3f
        );
        // console.log("X"+decodeByte( data[0] ) << 2);

        // Byte 0x01 :  Y-axis data of the joystick
        Update.component.call(
          this.joystick.left,
          "y", decodeByte( data[0] ) & 0x3f
        );

        Update.component.call(
          this.joystick.right,
          "x", ((data[0] & 0xc0) >> 3) + ((data[1] & 0xc0) >> 5) +  ((data[2] & 0x80) >> 7)
        );

        Update.component.call(
          this.joystick.right,
          "y", data[2] & 0x1f
        );

        // Update last data array cache
        last.set( this, data );
      }
    }
  }
};


Wii.Nunchuk = function( opts ) {
  return new Wii({
    freq: opts.freq || 100,
    device: "RVL-004"
  });
};

Wii.Classic = function( opts ) {
  return new Wii({
    freq: opts.freq || 100,
    device: "RVL-005"
  });
};


module.exports = Wii;
