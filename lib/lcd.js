var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    __ = require("../lib/fn.js");


var priv = new WeakMap(),
    Devices,
    characters;


/**
 * LCD
 * @param {[type]} opts [description]
 */
function LCD( opts ) {

  if ( !(this instanceof LCD) ) {
    return new LCD( opts );
  }

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options( opts )
  );

  var display = LCD.DISPLAYCONTROL | LCD.DISPLAYON;

  // options
  this.bitMode = opts.bitMode || 4;
  this.lines = opts.lines || 2;
  this.rows = opts.rows || 2;
  this.cols = opts.cols || 16;
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

  priv.set( this, {
    display: display,
    characters: {},
    index: LCD.MEMORYLIMIT - 1
  });

  opts.pins.forEach(function( pin ) {
    this.board.pinMode( pin, 1 );
  }, this);

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
    __.sleep(4);
    this.writeBits(0x03);
    __.sleep(4);
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
    this.command( display );
    this.clear();
    this.home();

    this.emit.call( this, "ready", null );
  }.bind(this), 50);
}

util.inherits( LCD, events.EventEmitter );


// |this| sensitive, must be called as
// LCD.hilo.call( lcd, callback );
LCD.hilo = function( callback ) {
  if ( !(this instanceof LCD) ) {
    throw new Error("Cannot toggle a non-LCD instance");
  }

  // RS High for write mode
  this.board.digitalWrite( this.pins.rs, this.firmata.HIGH );

  // Callback wrapped write this.command( charCode );functionality
  callback.call( this );

  // RS Low for command mode
  this.board.digitalWrite( this.pins.rs, this.firmata.LOW );
};

LCD.prototype.pulse = function() {
  [ "LOW", "HIGH", "LOW" ].forEach(function(val, i) {
    this.board.digitalWrite(this.pins.en, this.firmata[ val ] );
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
    process.nextTick( callback );
  }

  return this;
};

var RE_SPECIALS = /:(\w+):/g;

LCD.prototype.print = function( message, opts ) {
  var state, dontProcessSpecials, hasCharacters, processed;

  message = message + "";
  opts = opts || {};

  state = priv.get(this);
  dontProcessSpecials = opts.dontProcessSpecials || false;
  hasCharacters = !dontProcessSpecials && RE_SPECIALS.test(message);

  if ( message.length === 1 ) {
    LCD.hilo.call( this, function() {
      this.command( message.charCodeAt(0) );
    });
  } else {

    if ( hasCharacters ) {
      processed = message.replace(RE_SPECIALS, function(match, name) {
        var address = state.characters[name];
        return typeof address === "number"  ? String.fromCharCode(address) : match;
      });
      this.print(processed, {
        dontProcessSpecials: true
      });
    } else {
      LCD.hilo.call( this, function() {
        var k, chars, char;

        k = -1;
        chars = [].slice.call(message);

        while ( (char = chars[++k]) ) {
          this.command( char.charCodeAt(0) );
        }
      });
    }
  }

  return this;
};

LCD.prototype.write = function( charCode ) {
  LCD.hilo.call( this, function() {
    this.command( charCode );
  });

  return this;
};

LCD.prototype.clear = function() {
  this.command( LCD.CLEARDISPLAY );

  return this;
};

LCD.prototype.home = function() {
  this.command( LCD.RETURNHOME );
  __.sleep(2); // Command can be slow

  return this;
};

LCD.prototype.setCursor = function( col, row ) {
  var rowOffsets = [ 0x00, 0x40, 0x14, 0x54 ];
  this.command( LCD.SETDDRAMADDR | ( col + rowOffsets[ row ] ) );

  return this;
};

LCD.prototype.display = function() {
  var state = priv.get(this);

  state.display |= LCD.DISPLAYON;
  this.command( state.display );

  return this;
};

LCD.prototype.noDisplay = function() {
  var state = priv.get(this);

  state.display &= ~LCD.DISPLAYON;
  this.command( state.display );

  return this;
};

LCD.prototype.cursor = function( row, col ) {
  // When provided with col & row, cursor will behave like setCursor
  if ( typeof col !== "undefined" && typeof row !== "undefined" ) {
    return this.setCursor( col, row );
  }
  var state = priv.get(this);

  state.display |= LCD.CURSORON;
  this.command( state.display );

  return this;
};

LCD.prototype.noCursor = function() {
  var state = priv.get(this);

  state.display &= ~LCD.CURSORON;
  this.command( state.display );

  return this;
};

LCD.prototype.blink = function() {
  var state = priv.get(this);

  state.display |= LCD.BLINKON;
  this.command( state.display );

  return this;
};

LCD.prototype.noBlink = function() {
  var state = priv.get(this);

  state.display &= ~LCD.BLINKON;
  this.command( state.display );

  return this;
};

LCD.prototype.autoscroll = function() {
  var state = priv.get(this);

  state.display |= LCD.ENTRYSHIFTINCREMENT;
  this.command( LCD.ENTRYMODESET | state.display );

  return this;
};

LCD.prototype.noAutoscroll = function() {
  var state = priv.get(this);

  state.display &= ~LCD.ENTRYSHIFTINCREMENT;
  this.command( LCD.ENTRYMODESET | state.display );

  return this;
};

LCD.prototype.createChar = function( name, charMap ) {
  // Ensure location is never above 7
  var state, address;
  state = priv.get( this );

  if ( typeof name === "number" ) {
    address = name & 0x07;
  } else {
    address = state.index;
    state.index--;
    if ( state.index === -1 ) {
      state.index = LCD.MEMORYLIMIT - 1;
    }
  }

  this.command( LCD.SETCGRAMADDR | (address << 3) );

  LCD.hilo.call( this, function() {
    var i;
    for ( i = 0; i < 8; i++ ) {
      this.command( charMap[i] );
    }
  });

  // Fill in address
  state.characters[ name ] = address;

  return address;
};


LCD.prototype.useChar = function( name ) {
  var state;

  // Derive the current private state cache
  state = priv.get( this );

  if ( !state.characters[ name ] ) {
    // Create the character in LCD memory and
    // Add character to current LCD character map
    state.characters[ name ] = this.createChar( name, LCD.Characters[ name ] );
  }

  return state.characters[ name ];
};


LCD.Characters = require("../lib/lcd-chars.js");

// Create custom characters:
// http://www.darreltaylor.com/files/CustChar.htm




// createChar resources:
// http://www.hackmeister.dk/2010/08/custom-lcd-characters-with-arduino/
//

/**
 *

TODO:


burst()

scrollDisplayLeft()
scrollDisplayRight()

leftToRight()
rightToLeft()


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
LCD.BITMODE = [];
LCD.BITMODE[4] = 0x00;
LCD.BITMODE[8] = 0x10;
// 4 & 8

LCD.LINE = [];
LCD.LINE[1] = 0x00;
LCD.LINE[2] = 0x08;
// TODO: Support for >2 lines
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


LCD.MEMORYLIMIT = 8;




module.exports = LCD;






// http://www.arduino.cc/playground/Code/LCDAPI
