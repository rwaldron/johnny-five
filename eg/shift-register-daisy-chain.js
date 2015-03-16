/**
 * This example illustrates a 20-sided die roller using two seven-segment
 * displays and two daisy-chained 74HC595 shift registers.
 *
 * The button is a "momentary off" button.
 *
 * See docs/breadboard/seven-segment-daisy-chain.png
 * for the wiring.
 */
var five = require("../lib/johnny-five.js"),
  async = require("async"),
  _ = require("lodash");

var board = new five.Board(),
  Button = five.Button,
  ShiftRegister = five.ShiftRegister,
  Pin = five.Pin,

  /**
   * Change this to "true" if you are using common anode displays.
   *
   * This example uses common cathode displays.  If you only have common
   * anode seven-segment displays, you will need to change the wiring to use VCC
   * in place of GND.
   * @type {boolean}
   */
  COMMON_ANODE = false,

  /**
   * This is optional; you can reset the 74HC595's if one or both has
   * bizarre stuff stored in its EEPROM.
   *
   * Comment out if unused.
   * @type {number}
   */
  RESET_PIN = 9,

  /**
   * Segments we'll be using.  Die rolls produce no decimals, so we will
   * not be using "DP".
   * @type {string[]}
   */
  SEGMENTS = ["a", "b", "c", "d", "e", "f", "g"],

  /**
   * Mapping of LED segment names to their numeric values.
   * See "segments" definition within shift-register-seven-segment.js for
   * functionally equivalent code.
   * @type {Object.<string,number>}
   */
  segments = _.mapValues(_.object(SEGMENTS, _.range(SEGMENTS.length)),
    function(seg) {
      return 1 << seg;
    }),

  /**
   * Array of digits used in our die-roller.
   * @type {number[]}
   */
  digits = (function() {
    var A = segments.a,
      B = segments.b,
      C = segments.c,
      D = segments.d,
      E = segments.e,
      F = segments.f,
      G = segments.g;

    /**
     * These two-value arrays represent numbers from 1 through 20.
     * By performing a bitwise OR on segments, we can combine them to find
     * the numeric value of a digit.
     *
     * Constructing the numbers in this manner may help you visualize how it
     * works.
     *
     * These arrays are logically reversed; the second digit is the first,
     * and the first is the second.  When 0 is present, it means the display
     * is unused.
     *
     * @type {number[]}
     */
    return [
      [F | E | D | C | B | A, 0],                 // 0
      [C | B, 0],                                 // 1
      [G | E | D | A | B, 0],                     // 2
      [G | D | C | B | A, 0],                     // 3
      [G | F | C | B, 0],                         // 4
      [G | F | D | C | A, 0],                     // 5
      [G | F | E | D | C | A, 0],                 // 6
      [C | B | A, 0],                             // 7
      [G | F | E | D | C | B | A, 0],             // 8
      [G | F | D | C | B | A, 0],                 // 9
      [F | E | D | C | B | A, C | B],             // 10
      [C | B, C | B],                             // 11
      [G | E | D | A | B, C | B],                 // 12
      [G | D | C | B | A, C | B],                 // 13
      [G | F | C | B, C | B],                     // 14
      [G | F | D | C | A, C | B],                 // 15
      [G | F | E | D | C | A, C | B],             // 16
      [C | B | A, C | B],                         // 17
      [G | F | E | D | C | B | A, C | B],         // 18
      [G | F | D | C | B | A, C | B],             // 19
      [F | E | D | C | B | A, G | E | D | A | B]  // 20
    ];

  })();

board.on("ready", function() {

  /**
   * While we may have multiple ShiftRegisters,
   * we only need one to control them both.
   * @type {exports.ShiftRegister}
   */
  var register = new ShiftRegister({
      pins: {
        data: 2,
        clock: 3,
        latch: 4
      }
    }),

    /**
     * Pressing this button will trigger the die roll.  Because we're using a
     * "momentary-off" switch, "invert: true" is appropriate here.  If you have
     * a "momentary-on" switch, set "invert: false".
     * @type {Button}
     */
    btn = new Button({
      pin: 8,
      invert: true
    }),

    /**
     * Clears both displays
     */
    clear = function clear() {
      register.send.apply(register, COMMON_ANODE ? [255, 255] : [0, 0]);
    },

    /**
     * Resets the storage of the shift register.  Helpful if you stuff something
     * weird in the IC's EEPROM.
     *
     * To reset a 74HC595, you must make a low-to-high transition on STCP
     * (clock) while the MR pin (reset) is low.  Return reset to high thereafter
     * to end the reset function.  At least, I'm pretty sure that's what the
     * datasheet is getting at...
     * @type {function(this:*)}
     */
    reset = function reset() {
      if (typeof RESET_PIN !== "undefined") {
        this.digitalWrite(register.pins.clock, this.io.LOW);
        this.digitalWrite(RESET_PIN, this.io.LOW);
        this.digitalWrite(register.pins.clock, this.io.HIGH);
        this.digitalWrite(RESET_PIN, this.io.HIGH);
      }
    }.bind(this),

    /**
     * Inverts the pin output if we are using common anode.
     * @param {number} num
     * @returns {number}
     */
    invert = function invert(num) {
      return ((~num << 24) >> 24) & 255;
    },

    /**
     * Prints a digit (0-20) on the display(s).
     * @param {(Array|number)} num If number, will look up in digits array.
     */
    digit = function digit(num) {
      if (!_.isArray(num)) {
        num = digits[num - 1] || [0, 0];
      }
      register.send.apply(register, COMMON_ANODE ? _.map(num, invert) : num);
    },

    /**
     * Sends a random number to the shift register.
     */
    randomNumber = function randomNumber() {
      return digit(_.sample(digits));
    },

    /**
     * This is an array of delays in ms.  When a button is pressed,
     * we'll iterate over this array and display a random number after the
     * delay.  This simulates a die bouncing on a table.
     * @type {Array.<number>}
     */
    delays = new Array(10).fill(16)
    .concat(new Array(8).fill(32))
    .concat(new Array(6).fill(64))
    .concat(new Array(4).fill(128))
    .concat(new Array(2).fill(256))
    .concat(512);

  this.repl.inject({
    digit: digit,
    digits: digits,
    clear: clear,
    randomNumber: randomNumber,
    reset: reset
  });

  reset();
  clear();

  btn.on("press", function() {
    console.log("Rolling...");
    clear();
    async.eachSeries(delays, function(delay, done) {
      randomNumber();
      setTimeout(function() {
        clear();
        done();
      }, delay);
    }, randomNumber);
  });

});
