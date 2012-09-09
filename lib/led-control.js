/*

  This is a port of the LedControl library. Its license is as follows:

  LedControl.h - A library for controling Leds with a MAX7219/MAX7221
  Copyright (c) 2007 Eberhard Fahle

  This library is free software; you can redistribute it and/or
  modify it under the terms of the GNU Lesser General Public
  License as published by the Free Software Foundation; either
  version 2.1 of the License, or (at your option) any later version.

  This library is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public
  License along with this library; if not, write to the Free Software
  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

 */

var Board = require("../lib/board.js"),
    es6 = require("es6-collections"),
    WeakMap = es6.WeakMap;

// Led instance private data
var priv = new WeakMap();

function LedControl( opts ) {
  var i, j;

  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;
  this.status = [];

  priv.set( this, {
    maxDevices: opts.devices,
    pins: {
      data: opts.data,
      clock: opts.clock,
      cs: opts.cs
    }
  });

  Object.defineProperties( this, {
    devices: {
      get: function() {
        return priv.get( this ).devices;
      }
    },

    pins: {
      get: function() {
        return priv.get( this ).pins;
      }
    }
  });

  [ "data", "clock", "cs" ].forEach(function( pin ) {
    this.firmata.pinMode( this.pins[ pin ], this.firmata.MODES.OUTPUT );
  }, this);

  this.board.digitalWrite( this.pins.cs, this.firmata.HIGH );

  for ( i = 0; i < 64; i++ ) {
    this.status[ i ] = 0x00;
  }

  for ( j = 0; j < opts.devices; j++ ) {
    LedControl.send.call( this, j, LedControl.OP_DISPLAYTEST, 0 );
    this.setScanLimit( j, 7 );
    LedControl.send.call( this, j, LedControl.OP_DECODEMODE, 0 );
    this.clearDisplay( j );
    this.shutdown( j , true );
  }

}

LedControl.prototype.getDeviceCount = function() {
  return this.devices;
};

LedControl.prototype.on = function( addr ) {
  this.shutdown( addr, false );
};

LedControl.prototype.off = function( addr ) {
  this.shutdown( addr, true );
};

LedControl.prototype.shutdown = function( addr, status ) {
  // shuts off if status == true
  if ( addr >= this.devices ) { return; }
  LedControl.send.call(
    this, addr, LedControl.OP_SHUTDOWN, status ? 0 : 1
  );
};

LedControl.prototype.setScanLimit = function( addr, limit ) {
  if ( addr >= this.devices ) { return; }
  LedControl.send.call( this, addr, LedControl.OP_SCANLIMIT, limit );
};

LedControl.prototype.setIntensity = function( addr, intensity ) {
  if ( addr >= this.devices ) { return; }
  LedControl.send.call( this, addr, LedControl.OP_INTENSITY, intensity );
};

LedControl.prototype.clearDisplay = function( addr ) {
  var i;
  var offset =  addr * 8;

  for ( i = 0; i < 8; i++ ) {
    this.status[ offset + i ] = 0;
    LedControl.send.call( this, addr, i + 1, 0 );
  }
};

LedControl.prototype.setLed = function( addr, row, col, state ) {
  if ( addr >= this.devices ) { return; }

  var offset = addr * 8;
  var val = 0x80 >> col;

  if ( state ) {
    status[ offset + row ] = status[ offset + row ] | val;
  } else {
    val = ~val;
    status[ offset + row ] = status[ offset + row ] & val;
  }

  LedControl.send.call( this, addr, row + 1, status[ offset + row ] );
};

LedControl.prototype.setRow = function( addr, row, val /* 0 - 255 */ ) {
  if ( addr >= this.devices ) { return; }

  var offset = addr * 8;
  this.status[ offset + row ] = val;
  LedControl.send.call( this, addr, row + 1, status[ offset + row ] );
};

LedControl.prototype.setColumn = function( addr, col, val /* 0 - 255 */ ) {
  if ( addr >= this.devices ) { return; }

  var row;

  for ( row = 0; row < 8; row++ ) {
    val = val >> ( 7 - row );
    val = val & 0x01;
    this.setLed( addr, row, col, val );
  }
};

LedControl.prototype.setDigit = function( addr, digit, val, dp ) {
  var offset, v;

  if ( addr >= this.devices ) { return; }

  offset = addr * 8;

  v = LedControl.CHAR_TABLE[ val > 127 ? 32 : val ];

  if ( dp ) {
    v = v | 0x80;
  }

  status[ offset + digit ] = v;

  LedControl.send.call( this, addr, digit + 1, v );
};

LedControl.prototype.setChar = function( addr, digit, val, dp ) {
  this.setDigit( addr, digit, val, dp );
};


LedControl.send = function( addr, opcode, data ) {
  var offset = addr * 2;
  var maxBytes = this.devices * 2;
  var i, j;
  var spiData = [];

  for ( i = 0; i < maxBytes; i++ ) {
    spiData[ i ] = 0;
  }

  spiData[ offset + 1 ] = opcode;
  spidata[ offset ] = data;

  this.board.digitalWrite( this.pins.cs, this.firmata.LOW );

  for ( j = maxBytes; j > 0; j-- ) {
    this.board.shiftOut( this.pins.data, this.pins.clock, spiData[ j - 1 ]);
  }

  this.board.digitalWrite( this.pins.cs, this.firmata.HIGH );
};

LedControl.OP_NOOP =        0x00;

LedControl.OP_DIGIT0 =      0x01;
LedControl.OP_DIGIT1 =      0x02;
LedControl.OP_DIGIT2 =      0x03;
LedControl.OP_DIGIT3 =      0x04;
LedControl.OP_DIGIT4 =      0x05;
LedControl.OP_DIGIT5 =      0x06;
LedControl.OP_DIGIT6 =      0x07;
LedControl.OP_DIGIT7 =      0x08;

LedControl.OP_DECODEMODE =  0x09;
LedControl.OP_INTENSITY =   0x0a;
LedControl.OP_SCANLIMIT =   0x0b;
LedControl.OP_SHUTDOWN =    0x0c;
LedControl.OP_DISPLAYTEST = 0x0f;

LedControl.CHAR_TABLE = [
  "01111110", // 0
  "00110000", // 1
  "01101101", // 2
  "01111001", // 3
  "00110011", // 4
  "01011011", // 5
  "01011111", // 6
  "01110000", // 7
  "01111111", // 8
  "01111011", // 9
  "01110111", // a
  "00011111", // b
  "00001101", // c
  "00111101", // d
  "01001111", // e
  "01000111", // f
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "10000000",
  "00000001",
  "10000000",
  "00000000",
  "01111110",
  "00110000",
  "01101101",
  "01111001",
  "00110011",
  "01011011",
  "01011111",
  "01110000",
  "01111111",
  "01111011",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "01110111",
  "00011111",
  "00001101",
  "00111101",
  "01001111",
  "01000111",
  "00000000",
  "00110111",
  "00000000",
  "00000000",
  "00000000",
  "00001110",
  "00000000",
  "00000000",
  "00000000",
  "01100111",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00001000",
  "00000000",
  "01110111",
  "00011111",
  "00001101",
  "00111101",
  "01001111",
  "01000111",
  "00000000",
  "00110111",
  "00000000",
  "00000000",
  "00000000",
  "00001110",
  "00000000",
  "00000000",
  "00000000",
  "01100111",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000"
].map(function( str ) {
  return parseInt( str, 2 );
});