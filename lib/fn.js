var lodash = require("lodash");

var Fn = {
    assign: lodash.assign,
    extend: lodash.extend,
    defaults: lodash.defaults,
    debounce: lodash.debounce,
    cloneDeep: lodash.cloneDeep,
    mixin: lodash.mixin,
    every: lodash.every,
    pluck: lodash.pluck
  };

// Fn.fmap( val, fromLow, fromHigh, toLow, toHigh )
//
// Re-maps a number from one range to another.
// Based on arduino map()
//
// Return float
//
Fn.fmap = function(value, fromLow, fromHigh, toLow, toHigh) {
  return (value - fromLow) * (toHigh - toLow) /
    (fromHigh - fromLow) + toLow;
};

// Alias
Fn.fscale = Fn.fmap;

// Fn.map( val, fromLow, fromHigh, toLow, toHigh )
//
// Re-maps a number from one range to another.
// Based on arduino map()
//
// Retun int
//
Fn.map = function(value, fromLow, fromHigh, toLow, toHigh) {
  return Fn.fmap(value, fromLow, fromHigh, toLow, toHigh) | 0;
};

// Alias
Fn.scale = Fn.map;

// Fn.constrain( val, lower, upper )
//
// Constrains a number to be within a range.
// Based on arduino constrain()
//
Fn.constrain = function(value, lower, upper) {
  return Math.min(upper, Math.max(lower, value));
};

// Fn.range( upper )
// Fn.range( lower, upper )
// Fn.range( lower, upper, tick )
//
// Returns a new array range
//
Fn.range = function(lower, upper, tick) {

  if (arguments.length === 1) {
    upper = lower - 1;
    lower = 0;
  }

  lower = lower || 0;
  upper = upper || 0;
  tick = tick || 1;

  var len = Math.max(Math.ceil((upper - lower) / tick), 0),
    idx = 0,
    range = [];

  while (idx <= len) {
    range[idx++] = lower;
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
Fn.range.prefixed = function(prefix) {
  return Fn.range.apply(null, [].slice.call(arguments, 1)).map(function(val) {
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
Fn.square = function(x) {
  return x * x;
};

// Fn.sum( values )
//
// Returns the sum of all values from array
//
Fn.sum = function sum(values) {
  var vals;
  if (Array.isArray(values)) {
    vals = values;
  } else {
    vals = [].slice.call(arguments);
  }
  return vals.reduce(function(accum, value) {
    return accum + value;
  }, 0);
};

// fma function
// Copyright (c) 2012, Jens Nockert
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//  1. Redistributions of source code must retain the above copyright notice,
//     this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//     this list of conditions and the following disclaimer in the documentation
//     and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.
//
Fn.fma = function(a, b, c) {
  var aHigh = 134217729 * a;
  var aLow;

  aHigh = aHigh + (a - aHigh);
  aLow = a - aHigh;

  var bHigh = 134217729 * b;
  var bLow;

  bHigh = bHigh + (b - bHigh);
  bLow = b - bHigh;

  var r1 = a * b;
  var r2 = -r1 + aHigh * bHigh + aHigh * bLow + aLow * bHigh + aLow * bLow;

  var s = r1 + c;
  var t = (r1 - (s - c)) + (c - (s - r1));

  return s + (t + r2);
};
// end fma function copyright


// Fn._BV(bit)
//
// (from avr/io.h; "BV" => Bit Value)
//
// Return byte value with that bit set.
//
Fn._BV = Fn.bitValue = Fn.bv = function(bit) {
  return 1 << bit;
};

/*
  Example of _BV/bitValue usage...

  Logically OR these bits together:
  var ORed = _BV(0) | _BV(2) | _BV(7);

  BIT         7  6  5  4  3  2  1  0
  ---------------------------------------------------------
  _BV(0)  =   0  0  0  0  0  0  0  1
  _BV(2)  =   0  0  0  0  0  1  0  0
  _BV(7)  =   1  0  0  0  0  0  0  0
  ORed    =   1  0  0  0  0  1  0  1

  ORed === 133;

*/


// Fn.int16(high, low)

Fn.int16 = function(high, low) {
  var result = (high << 8) | low;

  // if highest bit is on, it is negative
  return result >> 15 ? ((result ^ 0xFFFF) + 1) * -1 : result;
};

Fn.uint16 = function(high, low) {
  return (high << 8) | low;
};

Fn.int24 = function(high, low, xlow) {
  var result = (high << 16) | (low << 8) | xlow;

  // if highest bit is on, it is negative
  return result >> 23 ? ((result ^ 0xFFFFFF) + 1) * -1 : result;
};

Fn.uint24 = function(high, low, xlow) {
  return (high << 16) | (low << 8) | xlow;
};


module.exports = Fn;

