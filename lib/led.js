var Board = require("../lib/board.js");

var priv = new WeakMap(),
    leds = [];

/**
 * Led
 * @constructor
 *
 * five.Led(pin);
 *
 * five.Led({
 *   pin: number
 *  });
 *
 *
 * @param {Object} opts [description]
 *
 */

function Led( opts ) {

  if ( !(this instanceof Led) ) {
    return new Led( opts );
  }

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options( opts )
  );

  // LED instance properties
  this.value = 0;
  this.interval = null;

  // TODO: use pin capability checks for LED value writing.

  // Create a "state" entry for privately
  // storing the state of the led
  leds.push( this );

  priv.set( this, {
    isOn: false,
    isRunning: false,
    value: 0
  });

  Object.defineProperties( this, {
    value: {
      get: function() {
        return priv.get( this ).value;
      }
    },
    isOn: {
      get: function() {
        return priv.get( this ).isOn;
      }
    },
    isRunning: {
      get: function() {
        return priv.get( this ).isRunning;
      }
    },
    pinMode: {
      set: function( mode ) {
        // set pinMode
        // TODO: if setting to PWM, check if this pin is capable of PWM
        // log error if not capable
        if ( this.mode !== mode ) {
          this.mode = mode;
          this.firmata.pinMode( this.pin, this.mode );
        }
      }
    }
  });

  // TODO: determine pinMode based on pin?
  //       based on type property?
  this.pin = opts && opts.pin || 9;
  this.mode = null;
  this.pinMode = this.firmata.MODES[ opts.type && opts.type.toUpperCase() || "OUTPUT" ];
}

/**
 * on Turn the led on
 * @return {Led}
 */
Led.prototype.on = function() {
  // Reset pinMode to OUTPUT
  this.pinMode = this.firmata.MODES.OUTPUT;

  this.firmata.digitalWrite( this.pin, this.firmata.HIGH );

  priv.set( this, {
    isOn: true,
    isRunning: false,
    value: 255
  });

  return this;
};

/**
 * off  Turn the led off
 * @return {Led}
 */
Led.prototype.off = function() {
  // Reset pinMode to OUTPUT
  this.pinMode = this.firmata.MODES.OUTPUT;

  this.firmata.digitalWrite( this.pin, this.firmata.LOW );

  priv.set( this, {
    isOn: false,
    isRunning: false,
    value: 0
  });

  return this;
};

/**
 * toggle Toggle the on/off state of an led
 * @return {Led}
 */
Led.prototype.toggle = function() {
  if ( this.isOn || this.isRunning ) {
    this.off();
  } else {
    this.on();
  }

  return this;
};

/**
 * brightness
 * @param  {Number} val analog brightness value 0-255
 * @return {Led}
 */
Led.prototype.brightness = function( val ) {
  // Reset pinMode to PWM
  this.pinMode = this.firmata.MODES.PWM;

  this.firmata.analogWrite( this.pin, val );

  priv.set( this, {
    isOn: val ? true : false,
    isRunning: this.isRunning,
    value: val
  });

  return this;
};

/**
 * pulse Fade the Led in and out in a specified time
 * @param  {number} rate Time in ms that a fade in/out will elapse
 * @return {Led}
 */
Led.prototype.pulse = function( time ) {
  // Avoid traffic jams
  if ( this.isRunning ) {
    return;
  }

  // Reset pinMode to PWM
  this.pinMode = this.firmata.MODES.PWM;

  var direction, to = ( time || 1000 ) / ( 255 * 2 );

  priv.set( this, {
    isOn: true,
    isRunning: true,
    value: this.value
  });

  this.interval = setInterval(function() {
    var valueAt = this.value;

    if ( valueAt === 0 ) {
      direction = 1;
    }

    if ( valueAt === 255 ) {
      direction = -1;
    }

    this.brightness( valueAt + direction );

  }.bind(this), to);

  return this;
};

/**
 * fade Fade an led in and out
 * @param  {Number} val  Analog brightness value 0-255
 * @param  {Number} time Time in ms that a fade in/out will elapse
 * @return {Led}
 */
Led.prototype.fade = function( val, time ) {
  // Avoid traffic jams
  if ( this.isRunning ) {
    return;
  }

  // Reset pinMode to PWM
  this.pinMode = this.firmata.MODES.PWM;

  var to = ( time || 1000 ) / ( (val || 255) * 2 ),
      direction = this.value <= val ? 1 : -1;

  priv.set( this, {
    isOn: true,
    isRunning: true,
    value: this.value
  });

  this.interval = setInterval(function() {
    var valueAt = this.value;

    if ( (direction > 0 && valueAt === 255) ||
          (direction < 0 && valueAt === 0) ||
            valueAt === val ) {

      this.stop();
    } else {
      this.brightness( valueAt + direction );
    }
  }.bind(this), to);

  return this;
};

Led.prototype.fadeIn = function( time ) {
  return this.fade( 255, time || 1000 );
};

Led.prototype.fadeOut = function( time ) {
  return this.fade( 0, time || 1000 );
};

/**
 * strobe
 * @param  {Number} rate Time in ms to strobe/blink
 * @return {Led}
 */
Led.prototype.strobe = function( rate ) {
  // Avoid traffic jams
  if ( this.isRunning ) {
    return;
  }

  // Reset pinMode to OUTPUT
  this.pinMode = this.firmata.MODES.OUTPUT;

  priv.set( this, {
    isOn: true,
    isRunning: true,
    value: this.value
  });

  if ( this.interval ) {
    clearInterval(this.interval);
  }

  this.interval = setInterval(function() {

    this.toggle();

  }.bind(this), rate || 100 );

  return this;
};

/**
 * stop Stop the led from strobing, pulsing or fading
 * @return {Led}
 */
Led.prototype.stop = function() {
  clearInterval( this.interval );

  priv.set( this, {
    isOn: this.isOn,
    isRunning: false,
    value: this.value
  });

  return this;
};



// TODO:
// Led.prototype.color = function() {
//   ...
//   return this;
// };


/**
 * Led.Array()
 * new Led.Array()
 *
 * Create an Array-like object instance of leds
 *
 * @return {Led.Array}
 */
Led.Array = function() {
  if ( !(this instanceof Led.Array) ) {
    return new Led.Array();
  }

  this.length = 0;

  leds.forEach(function( led, index ) {
    this[ index ] = led;

    this.length++;
  }, this );
};



/**
 * each Execute callbackFn for each active led instance in an Led.Array
 * @param  {Function} callbackFn
 * @return {Led.Array}
 */
Led.Array.prototype.each = function( callbackFn ) {
  var led, i, length;

  length = this.length;

  for ( i = 0; i < length; i++ ) {
    led = this[i];
    callbackFn.call( led, led, i );
  }

  return this;
};

/**
 * pulse Pulse all Leds
 *
 * @return {Led.Array}
 *
 * strobe Strobe all Leds
 *
 * @return {Led.Array}
 *
 */

[

  "on", "off", "toggle", "brightness",
  "fade", "fadeIn", "fadeOut",
  "pulse", "strobe",
  "stop"

].forEach(function( method ) {
  // Create Led.Array wrappers for each method listed.
  // This will allow us control over all Led instances
  // simultaneously.
  Led.Array.prototype[ method ] = function() {
    var args = [].slice.call( arguments );

    this.each(function( led ) {
      Led.prototype[ method ].apply( led, args );
    });
    return this;
  };
});


module.exports = Led;
