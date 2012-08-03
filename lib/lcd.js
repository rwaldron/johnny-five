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
    WeakMap = es6.WeakMap;


var DeviceMap,
    priv = new WeakMap();

DeviceMap = {

};

function sleep( milliSeconds ) {
  var startTime = Date.now();
  while ( Date.now() < startTime + milliSeconds ) {}
}

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
  this._currentDisplay = LCD.DISPLAYCONTROL | LCD.DISPLAYON;

  // options
  this.bitMode = opts.bitMode || 4;
  this.lines = opts.lines || 1;
  this.dots = opts.dots || "5x8";

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

  // Wait 50ms before initializing to make sure LCD is powered up
  // TODO: Don't use sleep
  setTimeout(function() {
    // Send 0011 thrice to make sure LCD is initialized properly
    this.writeBits(0x03);
    sleep(5);
    this.writeBits(0x03);
    sleep(5);
    this.writeBits(0x03);

    // Switch to 4-bit mode
    // TODO: Move to device map profile
    if ( this.bitMode === 4 ) {
      this.writeBits(0x02);
    }

    // Set number of lines and dots
    // TODO: Move to device map profile
    this.command(
      LCD.FUNCTIONSET |
      LCD.LINE[ this.lines ] |
      LCD.DOTS[ this.dots ]
    );

    // Clear display and turn it on
    this.command( this._currentDisplay );
    this.clear();
    this.home();

    this.emit("ready");
  }.bind(this), 50);
}

util.inherits( LCD, events.EventEmitter );

LCD.prototype.pulse = function() {
  [ "LOW", "HIGH", "LOW" ].forEach(function(val) {
    this.board.digitalWrite(this.pins.en, this.firmata[val] );
  }, this);

  return this;
};


LCD.prototype.writeBits = function( value ) {
  var pin, mask;

  pin = 0;
  mask = { 4: 8, 8: 128 }[ this.bitMode ];

  for ( ; mask > 0; mask = mask >> 1 ) {
    this.board.digitalWrite(
      this.pins.data[ pin ],
      this.firmata[ value & mask ? "HIGH" : "LOW" ]
    );
    pin++;
  }

  this.pulse();

  return this;
};


LCD.prototype.command = function( command, callback ) {
  if ( this.bitMode === 4 ) {
    this.writeBits( command >> 4 );
  }

  this.writeBits( command );

  if ( callback ) {
    process.nextTick(callback);
  }

  return this;
};

LCD.prototype.print = function( message ) {
  this.board.digitalWrite( this.pins.rs, this.firmata.HIGH );

  [].slice.call( String(message) ).forEach(function( char ) {
    this.command( char.charCodeAt(0), function() {
      sleep(200);
    });
  }, this );

  this.board.digitalWrite( this.pins.rs, this.firmata.LOW );

  return this;
};

LCD.prototype.write = function( charCode ) {
  this.board.digitalWrite( this.pins.rs, this.firmata.HIGH );
  this.command( charCode );
  this.board.digitalWrite( this.pins.rs, this.firmata.LOW );

  return this;
};

LCD.prototype.clear = function() {
  this.command( LCD.CLEARDISPLAY );

  return this;
};

LCD.prototype.home = function() {
  this.command( LCD.RETURNHOME );
  sleep(2); // Command can be slow

  return this;
};

LCD.prototype.setCursor = function( col, row ) {
  var rowOffsets = [ 0x00, 0x40, 0x14, 0x54 ];
  this.command( LCD.SETDDRAMADDR | ( col + rowOffsets[ row ] ) );

  return this;
};

LCD.prototype.display = function() {
  this._currentDisplay = this._currentDisplay | LCD.DISPLAYON;
  this.command( this._currentDisplay );

  return this;
};

LCD.prototype.noDisplay = function() {
  this._currentDisplay = this._currentDisplay & ~LCD.DISPLAYON;
  this.command( this._currentDisplay );

  return this;
};

LCD.prototype.cursor = function() {
  this._currentDisplay = this._currentDisplay | LCD.CURSORON;
  this.command( this._currentDisplay );

  return this;
};

LCD.prototype.noCursor = function() {
  this._currentDisplay = this._currentDisplay & ~LCD.CURSORON;
  this.command( this._currentDisplay );

  return this;
};

LCD.prototype.blink = function() {
  this._currentDisplay = this._currentDisplay | LCD.BLINKON;
  this.command( this._currentDisplay );

  return this;
};

LCD.prototype.noBlink = function() {
  this._currentDisplay = this._currentDisplay & ~LCD.BLINKON;
  this.command( this._currentDisplay );

  return this;
};

LCD.prototype.createChar = function( number, charMap ) {
  var location = number & 0x07; // Ensure location is never above 7
  this.command( LCD.SETCGRAMADDR | (location << 3) );

  for (var i = 0; i < 8; i++ ) {
    this.command( charMap[i] );
  }

  return this;
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
LCD.CLEARDISPLAY = 0x01;
LCD.RETURNHOME = 0x02;
LCD.ENTRYMODESET = 0x04;
LCD.DISPLAYCONTROL = 0x08;
LCD.CURSORSHIFT = 0x10;
LCD.FUNCTIONSET = 0x20;
LCD.SETCGRAMADDR = 0x40;
LCD.SETDDRAMADDR = 0x80;

// flags for display entry mode
LCD.ENTRYRIGHT = 0x00;
LCD.ENTRYLEFT = 0x02;
LCD.ENTRYSHIFTINCREMENT = 0x01;
LCD.ENTRYSHIFTDECREMENT = 0x00;

// flags for display on/off control
LCD.DISPLAYON = 0x04;
LCD.DISPLAYOFF = 0x00;
LCD.CURSORON = 0x02;
LCD.CURSOROFF = 0x00;
LCD.BLINKON = 0x01;
LCD.BLINKOFF = 0x00;

// flags for display/cursor shift
LCD.DISPLAYMOVE = 0x08;
LCD.CURSORMOVE = 0x00;
LCD.MOVERIGHT = 0x04;
LCD.MOVELEFT = 0x00;

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
