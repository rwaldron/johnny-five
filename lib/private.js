var __ = {};

// __.map( val, fromLow, fromHigh, toLow, toHigh )
//
// Re-maps a number from one range to another.
// Based on arduino map()
__.map = function( x, fromLow, fromHigh, toLow, toHigh ) {
  return ( x - fromLow ) * ( toHigh - toLow ) /
          ( fromHigh - fromLow ) + toLow;
};

// Alias
__.scale = __.map;

// __.constrain( val, lower, upper )
//
// Constrains a number to be within a range.
// Based on arduino constrain()
__.constrain = function( x, lower, upper ) {
  return x <= upper && x >= lower ? x :
          (x > upper ? upper : lower);
};

// __.range( upper )
// __.range( lower, upper )
// __.range( lower, upper, tick )
//
// Returns a new array range
//
__.range = function( lower, upper, tick ) {

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

// __.range.prefixed( prefix, upper )
// __.range.prefixed( prefix, lower, upper )
// __.range.prefixed( prefix, lower, upper, tick )
//
// Returns a new array range, each value prefixed
//
__.range.prefixed = function( prefix, lower, upper, tick ) {
  return __.range.apply( null, [].slice.call(arguments, 1) ).map(function( val ) {
    return prefix + val;
  });
};

// __.uid()
//
// Returns a reasonably unique id string
//
__.uid = function() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(chr) {
    var rnd = Math.random() * 16 | 0;
    return (chr === "x" ? rnd : (rnd & 0x3 | 0x8)).toString(16);
  }).toUpperCase();
};

// __.square()
//
// Returns squared x
//
__.square = function( x ) {
  return x * x;
};



module.exports = __;
