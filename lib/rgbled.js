var Board = require("../lib/board.js"),
    five = require("../lib/johnny-five.js"),
    es6 = require("es6-collections"),
    WeakMap = es6.WeakMap;

// Led instance private data
var priv = new WeakMap();
var colors = [ 'red', 'green', 'blue' ];

function RGBLed( opts ) {
  if ( !(this instanceof RGBLed) ) {
    return new RGBLed( opts );
  }

  opts = Board.options( opts );

  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;

  colors.forEach(function(color) {
    this[ color ] = new five.Led( opts[ color ] );
  }, this);

  priv.set(this, {
    red: 0,
    green: 0,
    blue: 0
  });
}

RGBLed.prototype.setColor = function( color ) {
  var red, green, blue;

  function hexToInt( val ) {
    return parseInt( val, 16 );
  }

  red = hexToInt( color.slice(0, 2) );
  green = hexToInt( color.slice(2, 4) );
  blue = hexToInt( color.slice(4, 6) );

  priv.set( this, {
    red: red,
    green: green,
    blue: blue
  });

  this.red.brightness( red );
  this.green.brightness( green );
  this.blue.brightness( blue );
};

RGBLed.prototype.on = function() {
  var brightness = priv.get( this )
  colors.forEach(function( color ) {
    this[ color ].on();
    this[ color ].brightness( brightness[ color ] );
  }, this);
};

RGBLed.prototype.off = function() {
  colors.forEach(function( color ) {
    this[ color ].off();
  }, this);
};

module.exports = RGBLed;