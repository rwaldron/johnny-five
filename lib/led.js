var Board = require("../lib/board.js");

var priv = new WeakMap(),
    LEDS = [];

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
  LEDS.push( this );

  priv.set( this, {
    isOn: false,
    isRunning: false,
    value: null,
    direction: 1,
    mode: null
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
        var state = priv.get( this );
        // set pinMode
        // TODO: if setting to PWM, check if this pin is capable of PWM
        // log error if not capable
        if ( state.mode !== mode ) {
          state.mode = mode;
          this.firmata.pinMode( this.pin, mode );
        }
      },
      get: function() {
        return priv.get( this ).mode;
      }
    }
  });

  this.pin = typeof opts.pin === "undefined" ? 9 : opts.pin;
  this.pinMode = this.firmata.MODES[
    opts.type && opts.type.toUpperCase() ||
    ( this.board.pins.isPwm(this.pin) ? "PWM" : "OUTPUT" )
  ];
}

/**
 * on Turn the led on
 * @return {Led}
 */
Led.prototype.on = function() {
  var state = priv.get( this );

  if ( state.mode === this.firmata.MODES.OUTPUT ) {
    this.firmata.digitalWrite( this.pin, this.firmata.HIGH );
  }

  if ( state.mode === this.firmata.MODES.PWM ) {
    // If there is no active interval, and state.value is null
    // then assume we need to simply turn this all the way on.
    if ( !this.interval && state.value === null ) {
      state.value = 255;
    }

    this.firmata.analogWrite( this.pin, state.value );
  }

  state.isOn = true;

  return this;
};

/**
 * off  Turn the led off
 * @return {Led}
 */
Led.prototype.off = function() {
  var state = priv.get( this );

  if ( state.mode === this.firmata.MODES.OUTPUT ) {
    this.firmata.digitalWrite( this.pin, this.firmata.LOW );
  }

  if ( state.mode === this.firmata.MODES.PWM ) {
    this.firmata.analogWrite( this.pin, 0 );
  }

  state.isOn = false;

  return this;
};

/**
 * toggle Toggle the on/off state of an led
 * @return {Led}
 */
Led.prototype.toggle = function() {
  var state = priv.get( this );

  if ( state.isOn ) {
    this.off();
  } else {
    this.on();
  }

  return this;
};

/**
 * brightness
 * @param  {Number} value analog brightness value 0-255
 * @return {Led}
 */
Led.prototype.brightness = function( value ) {
  var state = priv.get( this );

  // If pin is not a PWM pin, emit an error
  if ( !this.board.pins.isPwm(this.pin) ) {
    Board.Pins.Error({
      pin: this.pin,
      type: "PWM",
      via: "Led",
    });
  }

  // Reset pinMode to PWM
  this.pinMode = this.firmata.MODES.PWM;

  this.firmata.analogWrite( this.pin, value );

  state.value = value;

  return this;
};

/**
 * pulse Fade the Led in and out in a loop with specified time
 * @param  {number} rate Time in ms that a fade in/out will elapse
 * @return {Led}
 */
Led.prototype.pulse = function( time ) {
  var direction, to, state;
  to = ( time || 1000 ) / ( 255 * 2 );
  state = priv.get( this );

  if ( !this.board.pins.isPwm(this.pin) ) {
    Board.Pins.Error({
      pin: this.pin,
      type: "PWM",
      via: "Led",
    });
  }

  // Avoid traffic jams when pulse() is called
  // more then once on the same instance, with no
  // calls to stop()
  if ( this.interval ) {
    clearInterval( this.interval );

    // Use the previous direction
    direction = state.direction;
  }

  // Ensure pinMode is PWM
  this.pinMode = this.firmata.MODES.PWM;

  state.isOn = true;
  state.isRunning = true;

  this.interval = setInterval(function() {
    // Ensure the current value is at least the
    // number 0 (it may be null or 0)
    var valueAt = this.value || 0;

    // If state.isOn is true, then change
    // the visible state of the LED
    if ( state.isOn ) {
      if ( valueAt === 0 ) {
        direction = 1;
      }

      if ( valueAt === 255 ) {
        direction = -1;
      }

      this.firmata.analogWrite(
        this.pin, valueAt + direction
      );
      state.value = valueAt + direction;
      state.direction = direction;
    }
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
  var direction, to, state;
  direction = this.value <= val ? 1 : -1;
  to = ( time || 1000 ) / ( (val || 255) * 2 );
  state = priv.get( this );

  if ( !this.board.pins.isPwm(this.pin) ) {
    Board.Pins.Error({
      pin: this.pin,
      type: "PWM",
      via: "Led",
    });
  }

  // Avoid traffic jams
  if ( this.interval ) {
    clearInterval( this.interval );
  }

  // Reset pinMode to PWM
  this.pinMode = this.firmata.MODES.PWM;
  state.isOn = true;

  this.interval = setInterval(function() {
    var valueAt = this.value;

    // If state.isOn is true, then change
    // the visible state of the LED
    if ( state.isOn ) {
      if ( (direction > 0 && valueAt === 255) ||
            (direction < 0 && valueAt === 0) ||
              valueAt === val ) {

        this.stop();
      } else {
        this.firmata.analogWrite(
          this.pin, valueAt + direction
        );
        state.value = valueAt + direction;
        state.direction = direction;
      }
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
  var isHigh, state;
  isHigh = false;
  state = priv.get( this );

  // Avoid traffic jams
  if ( this.interval ) {
    clearInterval( this.interval );
  }


  // Reset pinMode to OUTPUT
  this.pinMode = this.firmata.MODES.OUTPUT;

  state.isOn = true;
  state.isRunning = true;
  state.value = this.value;

  this.interval = setInterval(function() {
    // If state.isOn is true, then change
    // the visible state of the LED
    if ( state.isOn ) {
      if ( isHigh ) {
        this.firmata.digitalWrite(
          this.pin, this.firmata.LOW
        );
      } else {
        this.firmata.digitalWrite(
          this.pin, this.firmata.HIGH
        );
      }
      isHigh = !isHigh;
    }
  }.bind(this), rate || 100 );

  return this;
};

Led.prototype.blink = Led.prototype.strobe;

/**
 * stop Stop the led from strobing, pulsing or fading
 * @return {Led}
 */
Led.prototype.stop = function() {
  var state = priv.get( this );

  clearInterval( this.interval );

  state.isOn = false;
  state.isRunning = false;
  state.value = this.value;

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
 * Create an Array-like object instance of LEDS
 *
 * @return {Led.Array}
 */
Led.Array = function( pins ) {
  if ( !(this instanceof Led.Array) ) {
    return new Led.Array( pins );
  }

  var leds = [];

  if ( pins ) {
    while ( pins.length ) {
      leds.push(
        new Led(pins.shift())
      );
    }
  } else {
    leds = LEDS.slice();
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


/**
 * Led.RGB
 *
 *
 * @param  {[type]} opts [description]
 * @return {[type]}      [description]
 */
Led.RGB = function( opts ) {
  if ( !(this instanceof Led.RGB) ) {
    return new Led.RGB( opts );
  }

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options( opts )
  );

  var color, colors, k;

  colors = Led.RGB.colors.slice();
  k = -1;

  // This will normalize an array of pins in [ r, g, b ]
  // order to an object that's shaped like:
  // {
  //   red: r,
  //   green: g,
  //   blue: b
  // }
  if ( Array.isArray(opts.pins) ) {
    opts.pins = colors.reduce(function( pins, pin, i, list ) {
      return (pins[ list[i] ] = opts.pins[i], pins);
    }, {});
  }

  // Initialize each Led instance
  while ( colors.length ) {
    color = colors.shift();
    this[ color ] = new Led({ pin: opts.pins[ color ], board: opts.board });
  }

  priv.set(this, {
    red: 0,
    green: 0,
    blue: 0
  });
};

Led.RGB.colors = [ "red", "green", "blue" ];

/**
 * color
 *
 * @param  {String} color Hexadecimal color string
 * @param  {Array} color Array of color values
 *
 * @return {Led.RGB}
 */
Led.RGB.prototype.color = function( value ) {
  var state, update;

  state = priv.get( this );

  update = {
    red: 0,
    green: 0,
    blue: 0
  };

  if ( !value ) {
    // Return a "copy" of the state values,
    // not a reference to the state object itself.
    return Led.RGB.colors.reduce(function( current, color ) {
      return (current[ color ] = state[ color ], current);
    }, {});
  }

  // Allows hex colors with leading #:
  // eg. #ff00ff
  if  ( value[0] === "#" ) {
    value = value.slice(1);
  }

  if ( typeof value === "string" ) {
    update.red = parseInt( value.slice(0, 2), 16 );
    update.green = parseInt( value.slice(2, 4), 16 );
    update.blue = parseInt( value.slice(4, 6), 16 );
  } else {
    update.red = value[ 0 ];
    update.green = value[ 1 ];
    update.blue = value[ 2 ];
  }

  Led.RGB.colors.forEach(function( color ) {
    state[ color ] = update[ color ];
    this[ color ].brightness( update[ color ] );
  }, this);

  return this;
};

Led.RGB.prototype.on = function() {
  var state = priv.get( this );

  Led.RGB.colors.forEach(function( color ) {
    this[ color ].on();
    this[ color ].brightness(
      state[ color ] !== 0 ? state[ color ] : 255
    );
  }, this);
};

Led.RGB.prototype.off = function() {
  Led.RGB.colors.forEach(function( color ) {
    this[ color ].off();
  }, this);
};



[
  "toggle", "brightness",
  "fade", "fadeIn", "fadeOut",
  "pulse", "strobe", "stop"

].forEach(function( method ) {
  // Create Led.Array wrappers for each method listed.
  // This will allow us control over all Led instances
  // simultaneously.
  Led.RGB.prototype[ method ] = function() {
    var args = [].slice.call( arguments );

    Led.RGB.colors.forEach(function( color ) {
      this[ color ][ method ]( args );
    }, this);

    return this;
  };
});



module.exports = Led;
