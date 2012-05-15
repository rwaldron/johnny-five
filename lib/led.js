// Derived and adapted from
// https://github.com/rwldrn/duino/blob/development/lib/led.js
var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    es6 = require("es6-collections"),
    WeakMap = es6.WeakMap;

// Led instance private data
var leds = [],
    led = new WeakMap();

function Led( opts ) {

  if ( !(this instanceof Led) ) {
    return new Led( opts );
  }

  opts = Board.options( opts );

  // Hardware instance properties
  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;

  // TODO: determine pinMode based on pin?
  //       based on type property?
  this.mode = this.firmata.MODES[ opts.type && opts.type.toUpperCase() || "OUTPUT" ];
  this.pin = opts && opts.pin || 9;

  // LED instance properties
  this.value = 0;
  this.interval = null;

  // Set the output mode
  this.firmata.pinMode( this.pin, this.mode );

  // TODO: use pin capability checks for LED value writing.

  // Create a "state" entry for privately
  // storing the state of the led
  leds.push( this );

  led.set( this, {
    isOn: false,
    value: 0
  });

  Object.defineProperties( this, {
    value: {
      get: function() {
        return led.get( this ).value;
      }
    },
    isOn: {
      get: function() {
        return led.get( this ).isOn;
      }
    }
  });
}

// on()
//
// Turn the Led "on"
//
Led.prototype.on = function() {
  // Reset pinMode to OUTPUT
  if ( this.mode !== this.firmata.MODES.OUTPUT ) {
    this.mode = this.firmata.MODES.OUTPUT;
    this.firmata.pinMode( this.pin, this.mode );
  }

  this.firmata.digitalWrite( this.pin, this.firmata.HIGH );

  led.set( this, {
    isOn: true,
    value: 255
  });

  return this;
};

// off()
//
// Turn the Led "off"
//
Led.prototype.off = function() {
  // Reset pinMode to OUTPUT
  if ( this.mode !== this.firmata.MODES.OUTPUT ) {
    this.mode = this.firmata.MODES.OUTPUT;
    this.firmata.pinMode( this.pin, this.mode );
  }

  this.firmata.digitalWrite( this.pin, this.firmata.LOW );

  led.set( this, {
    isOn: false,
    value: 0
  });

  return this;
};

// toggle()
//
// If the Led is off, turn it on; otherwise, turn it off.
//
Led.prototype.toggle = function() {
  // Reset pinMode to OUTPUT
  if ( this.mode !== this.firmata.MODES.OUTPUT ) {
    this.mode = this.firmata.MODES.OUTPUT;
    this.firmata.pinMode( this.pin, this.mode );
  }

  if ( led.get( this ).isOn ) {
    this.off();
  } else {
    this.on();
  }

  return this;
};

// brightness( val )
//
// Set the brightness of the led
//
Led.prototype.brightness = function( val ) {

  if ( this.mode !== this.firmata.MODES.PWM ) {
    this.mode = this.firmata.MODES.PWM;
    this.firmata.pinMode( this.pin, this.mode );
  }

  this.firmata.analogWrite( this.pin, val );

  led.set( this, {
    isOn: val ? true : false,
    value: val
  });

  return this;
};

// pulse( rate )
//
// Continuous fade in/out
// rate defaults to 1000ms
//
Led.prototype.pulse = function( time ) {
  // Reset pinMode to PWM
  // TODO: check if this pin is capable of PWM
  //       log error if not capable
  if ( this.mode !== this.firmata.MODES.PWM ) {
    this.mode = this.firmata.MODES.PWM;
    this.firmata.pinMode( this.pin, this.mode );
  }

  var to = ( time || 1000 ) / ( 255 * 2 );

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

// fade( val, time )
//
// Fade led brightness value over given time.
//
Led.prototype.fade = function( val, time ) {
  // Reset pinMode to PWM
  // TODO: check if this pin is capable of PWM
  //       log error if not capable
  if ( this.mode !== this.firmata.MODES.PWM ) {
    this.mode = this.firmata.MODES.PWM;
    this.firmata.pinMode( this.pin, this.mode );
  }

  var to = ( time || 1000 ) / ( (val || 255) * 2 ),
      direction = this.value <= val ? 1 : -1;

  this.interval = setInterval(function() {
    var valueAt = this.value;

    if ( (direction > 0 && valueAt === 255) ||
          (direction < 0 && valueAt === 0) ||
            valueAt === val ) {

      clearInterval( this.interval );
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

// strobe( rate )
//
// Flash led repeatedly, aka. "Blink"
//
Led.prototype.strobe = function( rate ) {
  // Reset pinMode to OUTPUT
  if ( this.mode !== this.firmata.MODES.OUTPUT ) {
    this.mode = this.firmata.MODES.OUTPUT;
    this.firmata.pinMode( this.pin, this.mode );
  }

  this.interval = setInterval(function() {

    this.toggle();

  }.bind(this), rate || 100 );

  return this;
};

Led.prototype.stop = function() {
  clearInterval( this.interval );
  return this;
};



// TODO:
// Led.prototype.color = function() {
//   ...
//   return this;
// };


// Static API

// Led.Array()
// new Led.Array()
//
// Return Array-like object instance of leds
//
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



// Led.Array, each( callbackFn )
//
// Execute callbackFn for each active led instance
//
// eg.
// array.each(function( led, index ) {
//
//  `this` refers to the current led instance
//
// });

Led.Array.prototype.each = function( callbackFn ) {
  var led, i, length;

  length = this.length;

  for ( i = 0; i < length; i++ ) {
    led = this[i];
    callbackFn.call( led, led, i );
  }

  return this;
};

// Led.Array, pulse()
//
// pulse all Leds
//
// eg. array.pulse();

// Led.Array, strobe()
//
// strobe all Leds
//
// eg. array.strobe();


[ "pulse", "strobe" ].forEach(function( method ) {
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
