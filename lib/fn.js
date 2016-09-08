var Fn = {
  debounce: require("lodash.debounce"),
  cloneDeep: require("lodash.clonedeep"),
};

// Fn.fmap( val, fromLow, fromHigh, toLow, toHigh )
//
// Re-maps a number from one range to another.
// Based on arduino map()
//
// Return float
//
Fn.toFixed = function(number, digits) {
  // Guard against error when number is null or undefined
  return +(number || 0).toFixed(digits);
};

// Fn.fmap( val, fromLow, fromHigh, toLow, toHigh )
//
// Re-maps a number from one range to another.
// Based on arduino map()
//
// Return Float32
//
var f32A = new Float32Array(1);

Fn.fmap = function(value, fromLow, fromHigh, toLow, toHigh) {
  f32A[0] = (value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
  return f32A[0];
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
  return ((value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow) | 0;
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


// Fn.inRange( val, lower, upper )
//
// Constrains a number to be within a range.
// Based on arduino constrain()
//
Fn.inRange = function(value, lower, upper) {
  return value >= lower && value <= upper;
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


/**
 * int16 Combine two bytes to make an signed 16-bit integer
 * @param  {byte} msb   Most signifcant byte
 * @param  {byte} lsb   Least signifcant byte
 * @return {word}       Signed 16-bit integer
 */
Fn.int16 = function(msb, lsb) {
  var result = (msb << 8) | lsb;

  // Check highest bit for sign. If on, value is negative
  return result >> 15 ? ((result ^ 0xFFFF) + 1) * -1 : result;
};

/**
 * uint16 Combine two bytes to make an unsigned 16-bit integer
 * @param  {byte} msb   Most signifcant byte
 * @param  {byte} lsb   Least signifcant byte
 * @return {word}       Signed 16-bit integer
 */
Fn.uint16 = function(msb, lsb) {
  return (msb << 8) | lsb;
};

/**
 * int24 Combine three bytes to make a signed 24-bit integer
 * @param  {byte} b16   b[16:23]
 * @param  {byte} b8    b[8:15]
 * @param  {byte} b0    b[0:7]
 * @return {word}       Signed 24-bit integer
 */
Fn.int24 = function(b16, b8, b0) {
  var result = (b16 << 16) | (b8 << 8) | b0;

  // Check highest bit for sign. If on, value is negative
  return result >> 23 ? ((result ^ 0xFFFFFF) + 1) * -1 : result;
};

/**
 * uint24 Combine three bytes to make an unsigned 24-bit integer
 * @param  {byte} b16   b[16:23]
 * @param  {byte} b8    b[8:15]
 * @param  {byte} b0    b[0:7]
 * @return {word}       Unsigned 24-bit integer
 */
Fn.uint24 = function(b16, b8, b0) {
  return (b16 << 16) | (b8 << 8) | b0;
};

/**
 * int32 Combine four bytes to make a signed 24-bit integer
 * @param  {byte} b24   b[24:31]
 * @param  {byte} b16   b[16:23]
 * @param  {byte} b8    b[8:15]
 * @param  {byte} b0    b[0:7]
 * @return {word}       Signed 32-bit integer
 */
Fn.int32 = function(b24, b16, b8, b0) {
  var result = (b24 << 24) | (b16 << 16) | (b8 << 8) | b0;

  // Check highest bit for sign. If on, value is negative
  return result >> 31 ? ((result ^ 0xFFFFFFFF) + 1) * -1 : result;
};

/**
 * int32 Combine four bytes to make a signed 24-bit integer
 * @param  {byte} b24   b[24:31]
 * @param  {byte} b16   b[16:23]
 * @param  {byte} b8    b[8:15]
 * @param  {byte} b0    b[0:7]
 * @return {word}       Signed 32-bit integer
 */
Fn.uint32 = function(b24, b16, b8, b0) {
  return (b24 << 24) | (b16 << 16) | (b8 << 8) | b0;
};

/**
 * bitSize Get the number of bits in a given number
 * @param  {number} n   The number to evaluate
 * @return {number}     The bit count
 */
Fn.bitSize = function(n) {
  return Math.round(Math.log2(n));
};

var POW = "POW_2_";
var U = "u";
var S = "s";
var MAX = Fn.bitSize(Number.MAX_SAFE_INTEGER) + 1;

for (var i = 0; i < MAX; i++) {
  Fn[POW + i] = Math.pow(2, i);
}

[ 4, 8, 10, 12, 16, 20, 24, 32 ].forEach(function(bitSize) {
  var decimal = Fn[POW + bitSize];
  var half = decimal / 2 >>> 0;
  var halfMinusOne = half - 1;

  Fn[U + bitSize] = function(value) {
    if (value < 0) {
      value += decimal;
    }
    return Fn.constrain(value, 0, decimal);
  };

  Fn[S + bitSize] = function(value) {
    if (value > halfMinusOne) {
      value -= decimal;
    }
    return Fn.constrain(value, -half, halfMinusOne);
  };
});
/*
  Fn.POW_2_0   => 1
  Fn.POW_2_1   => 2
  Fn.POW_2_2   => 4
  Fn.POW_2_3   => 8
  Fn.POW_2_4   => 16
  Fn.POW_2_5   => 32
  Fn.POW_2_6   => 64
  Fn.POW_2_7   => 128
  Fn.POW_2_8   => 256
  Fn.POW_2_9   => 512
  Fn.POW_2_10  => 1024
  Fn.POW_2_11  => 2048
  Fn.POW_2_12  => 4096
  Fn.POW_2_13  => 8192
  Fn.POW_2_14  => 16384
  Fn.POW_2_15  => 32768
  Fn.POW_2_16  => 65536
  Fn.POW_2_17  => 131072
  Fn.POW_2_18  => 262144
  Fn.POW_2_19  => 524288
  Fn.POW_2_20  => 1048576
  Fn.POW_2_21  => 2097152
  Fn.POW_2_22  => 4194304
  Fn.POW_2_23  => 8388608
  Fn.POW_2_24  => 16777216
  Fn.POW_2_25  => 33554432
  Fn.POW_2_26  => 67108864
  Fn.POW_2_27  => 134217728
  Fn.POW_2_28  => 268435456
  Fn.POW_2_29  => 536870912
  Fn.POW_2_30  => 1073741824
  Fn.POW_2_31  => 2147483648
  Fn.POW_2_32  => 4294967296
  Fn.POW_2_33  => 8589934592
  Fn.POW_2_34  => 17179869184
  Fn.POW_2_35  => 34359738368
  Fn.POW_2_36  => 68719476736
  Fn.POW_2_37  => 137438953472
  Fn.POW_2_38  => 274877906944
  Fn.POW_2_39  => 549755813888
  Fn.POW_2_40  => 1099511627776
  Fn.POW_2_41  => 2199023255552
  Fn.POW_2_42  => 4398046511104
  Fn.POW_2_43  => 8796093022208
  Fn.POW_2_44  => 17592186044416
  Fn.POW_2_45  => 35184372088832
  Fn.POW_2_46  => 70368744177664
  Fn.POW_2_47  => 140737488355328
  Fn.POW_2_48  => 281474976710656
  Fn.POW_2_49  => 562949953421312
  Fn.POW_2_50  => 1125899906842624
  Fn.POW_2_51  => 2251799813685248
  Fn.POW_2_52  => 4503599627370496
  Fn.POW_2_53  => 9007199254740992

  Fn.u4(value) => 4-bit Unsigned Integer
  Fn.s4(value) => 4-bit Signed Integer

  Fn.u8(value) => 8-bit Unsigned Integer
  Fn.s8(value) => 8-bit Signed Integer

  Fn.u10(value) => 10-bit Unsigned Integer
  Fn.s10(value) => 10-bit Signed Integer

  Fn.u12(value) => 12-bit Unsigned Integer
  Fn.s12(value) => 12-bit Signed Integer

  Fn.u16(value) => 16-bit Unsigned Integer
  Fn.s16(value) => 16-bit Signed Integer

  Fn.u20(value) => 20-bit Unsigned Integer
  Fn.s20(value) => 20-bit Signed Integer

  Fn.u24(value) => 24-bit Unsigned Integer
  Fn.s24(value) => 24-bit Signed Integer

  Fn.u32(value) => 32-bit Unsigned Integer
  Fn.s32(value) => 32-bit Signed Integer

}
*/

Fn.RAD_TO_DEG = 180 / Math.PI;
Fn.DEG_TO_RAD = Math.PI / 180;
Fn.TAU = 2 * Math.PI;

module.exports = Fn;
