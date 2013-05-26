var lodash = require("lodash"),
    Fn = {
      assign: lodash.assign,
      extend: lodash.extend,
      debounce: lodash.debounce
    };

// Fn.map( val, fromLow, fromHigh, toLow, toHigh )
//
// Re-maps a number from one range to another.
// Based on arduino map()
Fn.map = function( x, fromLow, fromHigh, toLow, toHigh ) {
  return ( x - fromLow ) * ( toHigh - toLow ) /
          ( fromHigh - fromLow ) + toLow;
};

// Alias
Fn.scale = Fn.map;

// Fn.constrain( val, lower, upper )
//
// Constrains a number to be within a range.
// Based on arduino constrain()
Fn.constrain = function( x, lower, upper ) {
  return x <= upper && x >= lower ? x :
          (x > upper ? upper : lower);
};

// Fn.range( upper )
// Fn.range( lower, upper )
// Fn.range( lower, upper, tick )
//
// Returns a new array range
//
Fn.range = function( lower, upper, tick ) {

  if ( arguments.length === 1 ) {
    upper = lower;
    lower = 0;
  }

  lower = lower || 0;
  upper = upper || 0;
  tick = tick || 1;

  var len = Math.max( Math.ceil( (upper - lower) / tick ), 0 ),
      idx = 0,
      range = [];

  while ( idx <= len ) {
    range[ idx++ ] = lower;
    lower += tick;
  }

  return range;
};

// Fn.range.prefixed( prefix, upper )
// Fn.range.prefixed( prefix, lower, upper )
// Fn.range.prefixed( prefix, lower, upper, tick )
//
// Returns a new array range, each value prefixed
//
Fn.range.prefixed = function( prefix, lower, upper, tick ) {
  return Fn.range.apply( null, [].slice.call(arguments, 1) ).map(function( val ) {
    return prefix + val;
  });
};

// Fn.uid()
//
// Returns a reasonably unique id string
//
Fn.uid = function() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(chr) {
    var rnd = Math.random() * 16 | 0;
    return (chr === "x" ? rnd : (rnd & 0x3 | 0x8)).toString(16);
  }).toUpperCase();
};

// Fn.square()
//
// Returns squared x
//
Fn.square = function( x ) {
  return x * x;
};

// Fn.sleep( ms )
//  delay for ms
//
// Returns undefined
//
Fn.sleep = function( ms ) {
  var start = Date.now();
  while ( Date.now() < start + ms ) {}
};




module.exports = Fn;
