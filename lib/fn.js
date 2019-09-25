const Fn = {
  debounce: require("lodash.debounce"),
  cloneDeep: require("lodash.clonedeep"),
};

const { ceil, max, min, PI } = Math;

/**
 * Format a number such that it has a given number of digits after the
 * decimal point.
 *
 * @param {Number} number - The number to format
 * @param {Number} [digits = 0] - The number of digits after the decimal point
 * @return {Number} Formatted number
 * @example
 * Fn.toFixed(5.4564, 2); // -> 5.46
 * @example
 * Fn.toFixed(1.5, 2); // -> 1.5
 */
Fn.toFixed = (number, digits) => +(number || 0).toFixed(digits);


/**
 * Map a value (number) from one range to another. Based on Arduino's map().
 *
 * @param {Number} value    - value to map
 * @param {Number} fromLow  - low end of originating range
 * @param {Number} fromHigh - high end of originating range
 * @param {Number} toLow    - low end of target range
 * @param {Number} toHigh   - high end of target range
 * @return {Number} mapped value (integer)
 * @example
 * Fn.map(500, 0, 1000, 0, 255); // ->
 */

Fn.map = (value, fromLow, fromHigh, toLow, toHigh) => ((value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow) | 0;
// Alias
Fn.scale = Fn.map;

/**
 * Like map, but returns a Float32
 *
 * For @param info, @see Fn.map
 * @return {Float32}
 */
const f32A = new Float32Array(1);

Fn.fmap = (value, fromLow, fromHigh, toLow, toHigh) => {
  f32A[0] = (value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
  return f32A[0];
};
// Alias
Fn.fscale = Fn.fmap;

/**
 * Constrains a number to be within a range. Based on Arduino's constrain()
 *
 * @param {Number} value
 * @param {Number} lower - lower bound of range for constraint
 * @param {Number} upper - upper bound of range for constraint
 * @return {Number | NaN} constrained number or NaN if any of the provided
 *   parameters are not a {Number}.
 */
Fn.constrain = (value, lower, upper) => min(upper, max(lower, value));

/**
 * Is value between the bounds of lower and upper?
 *
 * @param {Number} value
 * @param {Number} lower - Lower end of bounds to check
 * @param {Number} upper - Upper ends of bounds to check
 * @return {Boolean}
 */
Fn.inRange = (value, lower, upper) => value >= lower && value <= upper;

/**
 * Generate an Array of Numbers with values between lower and upper; the
 * step (increment/decrement) between each defined by tick.
 *
 * @param {Number} lower - The value of the lowest element in the resulting
 *                         Array. If `Fn.range` invoked with only one
 *                         argument, this parameter will instead define the
 *                         length of the Array, which will start from 0.
 * @param {Number} upper - The value of the final element of the Array.
 * @param {Number} [tick = 1] - The difference between each element in the
 *                              Array. This value may be negative.
 * @return {Array} of {Numbers}
 *
 * @example
 * Fn.range(5, 10); // -> [5, 6, 7, 8, 9, 10];
 * @example
 * Fn.range(5); // -> [0, 1, 2, 3, 4];
 * @example
 * Fn.range(3, 27, 3); // -> [3, 6, 9, 12, 15, 18, 21, 24, 27];
 * @example
 * Fn.range(0, -9, -3); // -> [0, -3, -6, -9];
 */
Fn.range = function(lower, upper, tick) {
  if (arguments.length === 1) {
    upper = lower - 1;
    lower = 0;
  }

  lower = lower || 0;
  upper = upper || 0;
  tick = tick || 1;

  const len = max(ceil((upper - lower) / tick), 0);
  let idx = 0;
  const range = [];

  while (idx <= len) {
    range[idx++] = lower;
    lower += tick;
  }

  return range;
};

/**
 * Generate a reasonably-unique ID string
 *
 * @return {String} - 36-character random-ish string
 */
Fn.uid = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, chr => {
  const rnd = Math.random() * 16 | 0;
  return (chr === "x" ? rnd : (rnd & 0x3 | 0x8)).toString(16);
}).toUpperCase();


/**
 * Square your x!
 *
 * @param {Number} x
 * @return {Number| Nan} - x^2—unless you were goofy enough to provide a
 *   non-numeric x, in which case it's NaN for you!
 */
Fn.square = x => x * x;

/**
 * Get a sum for all the values in an Array. This works best if the elements
 * in the Array are Numbers.
 *
 * @param {Array} values
 * @return {Number | String} - You probably want a Number so you'll want to
 *                             pass a values Array entirely consisting of
 *                             numeric elements.
 */
Fn.sum = function sum(values) {
  let vals;
  if (Array.isArray(values)) {
    vals = values;
  } else {
    vals = [].slice.call(arguments);
  }
  return vals.reduce((accum, value) => accum + value, 0);
};

/**
 * Fused multiply-add for precise floating-point calculations.
 */
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
Fn.fma = (a, b, c) => {
  let aHigh = 134217729 * a;
  let aLow;

  aHigh = aHigh + (a - aHigh);
  aLow = a - aHigh;

  let bHigh = 134217729 * b;
  let bLow;

  bHigh = bHigh + (b - bHigh);
  bLow = b - bHigh;

  const r1 = a * b;
  const r2 = -r1 + aHigh * bHigh + aHigh * bLow + aLow * bHigh + aLow * bLow;

  const s = r1 + c;
  const t = (r1 - (s - c)) + (c - (s - r1));

  return s + (t + r2);
};
// end fma function copyright

/**
 * Return a value with the bit at the position indicated set (to 1).
 * From avr/io.h "BV" => Bit Value
 *
 * An example: logically OR these bits together:
 * var ORed = _BV(0) | _BV(2) | _BV(7);
 *
 * BIT         7  6  5  4  3  2  1  0
 * ---------------------------------------------------------
 * _BV(0)  =   0  0  0  0  0  0  0  1
 * _BV(2)  =   0  0  0  0  0  1  0  0
 * _BV(7)  =   1  0  0  0  0  0  0  0
 * ORed    =   1  0  0  0  0  1  0  1
 *
 * ORed === 133;
 *
 * @param {Number} bit - bit position to set
 * @return {Number}
 * @example
 * Fn.bitValue(0); // --> 1
 * @example
 * Fn.bitValue(4); // --> 16
 *
 */
Fn._BV = Fn.bitValue = Fn.bv = bit => 1 << bit;

/**
 * int16 Combine two bytes to make an signed 16-bit integer
 * @param  {byte} msb   Most signifcant byte
 * @param  {byte} lsb   Least signifcant byte
 * @return {word}       Signed 16-bit integer
 */
Fn.int16 = (msb, lsb) => {
  const result = (msb << 8) | lsb;

  // Check highest bit for sign. If on, value is negative
  return result >> 15 ? ((result ^ 0xFFFF) + 1) * -1 : result;
};

/**
 * uint16 Combine two bytes to make an unsigned 16-bit integer
 * @param  {byte} msb   Most signifcant byte
 * @param  {byte} lsb   Least signifcant byte
 * @return {word}       unsigned 16-bit integer
 */
Fn.uint16 = (msb, lsb) => (msb << 8) | lsb;

/**
 * int24 Combine three bytes to make a signed 24-bit integer
 * @param  {byte} b16   b[16:23]
 * @param  {byte} b8    b[8:15]
 * @param  {byte} b0    b[0:7]
 * @return {word}       Signed 24-bit integer
 */
Fn.int24 = (b16, b8, b0) => {
  const result = (b16 << 16) | (b8 << 8) | b0;

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
Fn.uint24 = (b16, b8, b0) => (b16 << 16) | (b8 << 8) | b0;

/**
 * int32 Combine four bytes to make a signed 24-bit integer
 * @param  {byte} b24   b[24:31]
 * @param  {byte} b16   b[16:23]
 * @param  {byte} b8    b[8:15]
 * @param  {byte} b0    b[0:7]
 * @return {word}       Signed 32-bit integer
 */
Fn.int32 = (b24, b16, b8, b0) => {
  const result = (b24 << 24) | (b16 << 16) | (b8 << 8) | b0;
  // Check highest bit for sign. If on, value is negative
  return result >> 31 ? ((result ^ 0xFFFFFFFF) + 1) * -1 : result;
};

/**
 * int32 Combine four bytes to make an unsigned 32-bit integer
 * @param  {byte} b24   b[24:31]
 * @param  {byte} b16   b[16:23]
 * @param  {byte} b8    b[8:15]
 * @param  {byte} b0    b[0:7]
 * @return {Number}       unsigned 32-bit integer
 */
Fn.uint32 = (b24, b16, b8, b0) => // Note: If you left-shift a byte by 24 in JS and that byte's
// MSbit is 1, the resulting value will be negative because JS casts
// bitwise operands (temporarily) to SIGNED 32-bit numbers. The
// final >>> 0 causes the sign bit to be disregarded, making sure our
// result is non-negative.
((b24 << 24) | (b16 << 16) | (b8 << 8) | b0) >>> 0;

/**
 * bitSize Get the number of bits in a given number
 * @param  {number} n   The number to evaluate
 * @return {number}     The bit count
 */
Fn.bitSize = n => Math.round(Math.log2(n));

/**
 * The following generates functions and constants for utility when working
 * with binary numbers:
 *   - Fn.POW_2_0 through Fn.POW_2_53
 *   - Fn.u4(value) through Fn.u32(value)
 *   - Fn.s4(value) through Fn.s32(value)
 */
const POW = "POW_2_";
const U = "u";
const S = "s";
const MAX = Fn.bitSize(Number.MAX_SAFE_INTEGER) + 1;
const bitSizes = [ 4, 8, 10, 12, 16, 20, 24, 32 ];

/**
 * Generate "constants" that represent powers of 2. Available for powers
 * 0 through 53.
 * @example
 * Fn.POW_2_17; // -> 131072
 */
for (let i = 0; i < MAX; i++) {
  Fn[POW + i] = 2 ** i;
}

bitSizes.forEach(bitSize => {
  const decimal = Fn[POW + bitSize];
  const half = decimal / 2 >>> 0;
  const halfMinusOne = half - 1;

  /**
   * The function Fn["u" + bitSize] will constrain a value to an unsigned
   * value of that bit size.
   *
   * @param {Number} value
   * @return {Number} constrained to an unsigned int
   * @example
   * Fn.u8(255); // --> 255
   * Fn.u8(256); // --> 255
   * Fn.u8(-255); // --> 0
   * Fn.u8(-254); // -- 1
   */
  Fn[U + bitSize] = value => {
    if (value < 0) {
      value += decimal;
    }
    return Fn.constrain(value, 0, decimal - 1);
  };

  /**
   * The function Fn["s" + bitSize] will constrain a value to a signed value
   * of that bit size. Remember that, e.g., range for signed 8-bit numbers
   * is -128 to 127.
   *
   * @param {Number} value
   * @return {Number} constrained to a SIGNED integer in bitsize range
   * @example
   * Fn.s8(100); // --> 100
   * Fn.s8(128); // --> -128
   * Fn.s8(127); // --> 127
   * Fn.s8(255); // --> -1
   */
  Fn[S + bitSize] = value => {
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

Fn.RAD_TO_DEG = 180 / PI;
Fn.DEG_TO_RAD = PI / 180;
Fn.TAU = 2 * PI;

module.exports = Fn;
