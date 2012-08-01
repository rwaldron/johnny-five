// Initial LCD draft based on Andreas Haugstrup Pedersen's
// proof of concept: https://gist.github.com/3200887
//
//
//
var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    __ = require("../lib/fn.js"),
    es6 = require("es6-collections"),
    WeakMap = es6.WeakMap


var DeviceMap,
    priv = new WeakMap();


DeviceMap = {

};

/**
 * LCD
 * @param {[type]} opts [description]
 */
function LCD( opts ) {

  if ( !(this instanceof LCD) ) {
    return new LCD( opts );
  }

  opts = Board.options( opts );

  // Hardware instance properties
  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;


  this.pins = {
    rs: opts.pins[0],
    en: opts.pins[1],
    // TODO: Move to device map profile
    data: [
      opts.pins[5],
      opts.pins[4],
      opts.pins[3],
      opts.pins[2]
    ]
  };

  // TODO: ALL OF THIS NEEDS TO BE RE-WRITTEN
  //
  //
  // RS to low (for command mode), EN to low to start
  // TODO: Move to device map profile
  this.board.digitalWrite( this.pins.rs, this.firmata.LOW );
  this.board.digitalWrite( this.pins.en, this.firmata.LOW );

  // Switch to 4-bit mode
  // TODO: Move to device map profile
  // TODO: will this.command( 2 ) work here?
  this.board.digitalWrite( this.pins.data[0], this.firmata.LOW );
  this.board.digitalWrite( this.pins.data[1], this.firmata.LOW );
  this.board.digitalWrite( this.pins.data[2], this.firmata.HIGH );
  this.board.digitalWrite( this.pins.data[3], this.firmata.LOW );

  this.pulse();

  // Set to two-line mode
  // TODO: Move to device map profile
  this.command( LCD.FUNCTIONSET | LCD.LINE[2] );


  // Clear display and turn it on
  this.clear();

  setTimeout(function() {
    this.ready = true;
  }.bind(this), 200);
}


// LCD.prototype.noBacklight = function() {
//   this.burst( [ LCD.BACKLIGHT.OFF ]);
// };

LCD.prototype.pulse = function() {
  [ 'HIGH', 'LOW' ].forEach(function(val) {
    this.board.digitalWrite(this.pins.en, this.firmata[val] );
  }, this);
};


LCD.prototype.command = function(command /* integer, 0-255 */, callback) {
  var pin = 0;

  for (var mask = 128; mask > 0; mask = mask >> 1) {
    if (pin === 3) {
      this.pulse();
      pin = 0;
    }

    this.board.digitalWrite( this.pins.data[pin], command & mask);
    pin++;
  }

  if ( callback ) {
    process.nextTick(callback);
  }
};

LCD.prototype.write = function( message ) {

  // If the LCD is not ready, try again until it is.
  if ( !this.ready ) {
    setTimeout(function() {
      this.write( message );
    }.bind(this), 0);
  } else {
  // Otherwise, make with writing to the device

    // Clear
    this.board.digitalWrite( this.pins.rs, this.firmata.LOW );

    this.clear();

    // Prepare
    this.board.digitalWrite( this.pins.rs, this.firmata.HIGH );

    // Write each character, one at a time
    var characters = [].slice.call( String(message) );

    function next(i) {
      this.command( characters[i].charCodeAt(0) );

      if (++i > characters.length) { return; }

      setTimeout(function() {
        next.call(this, i);
      }.bind(this), 200);
    }

    next.call(this, 0);

    this.board.digitalWrite( this.pins.rs, this.firmata.LOW );
  }
};




LCD.prototype.clear = function() {
  this.command( LCD.CLEARDISPLAY );
};

/**
 *

begin()
clear()
home()
setCursor()
burst()
print()
cursor()
noCursor()
blink()
noBlink()
display()
noDisplay()
scrollDisplayLeft()
scrollDisplayRight()
autoscroll()
noAutoscroll()
leftToRight()
rightToLeft()
createChar()


*/


// commands
LCD.CLEARDISPLAY = 0x01
LCD.RETURNHOME = 0x02
LCD.ENTRYMODESET = 0x04
LCD.DISPLAYCONTROL = 0x08
LCD.CURSORSHIFT = 0x10
LCD.FUNCTIONSET = 0x20
LCD.SETCGRAMADDR = 0x40
LCD.SETDDRAMADDR = 0x80

// flags for display entry mode
LCD.ENTRYRIGHT = 0x00
LCD.ENTRYLEFT = 0x02
LCD.ENTRYSHIFTINCREMENT = 0x01
LCD.ENTRYSHIFTDECREMENT = 0x00

// flags for display on/off control
LCD.DISPLAYON = 0x04
LCD.DISPLAYOFF = 0x00
LCD.CURSORON = 0x02
LCD.CURSOROFF = 0x00
LCD.BLINKON = 0x01
LCD.BLINKOFF = 0x00

// flags for display/cursor shift
LCD.DISPLAYMOVE = 0x08
LCD.CURSORMOVE = 0x00
LCD.MOVERIGHT = 0x04
LCD.MOVELEFT = 0x00

// flags for function set
// Intentionally sparse array
LCD.BITMODE = [ , , , , 0x00, , , , 0x10 ];
// 4 & 8

// Intentionally sparse array
LCD.LINE = [ , 0x00, 0x08 ];
// 1 & 2

LCD.DOTS = {
  "5x10": 0x04,
  "5x8": 0x00
};

// flags for backlight control
LCD.BACKLIGHT = {
  ON: 0x08,
  OFF: 0x00
};



module.exports = LCD;






// http://www.arduino.cc/playground/Code/LCDAPI
