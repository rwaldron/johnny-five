/**
 * This example uses a single seven-segment display (common anode) and a
 * 74HC595 shift register. See docs/breadboard/seven-segment.png for wiring.
 */
var five = require("../lib/johnny-five.js"),
    sr, led;

var board = new five.Board()

board.on("ready", function() {

  /*

    This assumes the segments are as follows:

       A
      ---
    F | | B
      --- <---- G
    E | | C
      ---
       D  o DP

   */

  var commonAnode = true;
  var digits = [];

  //                    .GFEDCBA
  digits[0] = parseInt('00111111', 2);  // 0
  digits[1] = parseInt('00000110', 2);  // 1
  digits[2] = parseInt('01011011', 2);  // 2
  digits[3] = parseInt('01001111', 2);  // 3
  digits[4] = parseInt('01100110', 2);  // 4
  digits[5] = parseInt('01101101', 2);  // 5
  digits[6] = parseInt('01111101', 2);  // 6
  digits[7] = parseInt('00000111', 2);  // 7
  digits[8] = parseInt('01111111', 2);  // 8
  digits[9] = parseInt('01101111', 2);  // 9

  var segments = {
    //              .GFEDCBA
    a   : parseInt('00000001', 2),
    b   : parseInt('00000010', 2),
    c   : parseInt('00000100', 2),
    d   : parseInt('00001000', 2),
    e   : parseInt('00010000', 2),
    f   : parseInt('00100000', 2),
    g   : parseInt('01000000', 2),
    dp  : parseInt('10000000', 2)
  };

  sr = new five.ShiftRegister({
    pins: {
      data: 2,
      clock: 3,
      latch: 4
    }
  });

  led = new five.Led(5);

  function invert(num) {
    return ((~num << 24) >> 24) & 255;
  }

  sr.digit = function(num) {
    sr.clear();

    var val = commonAnode ? invert(digits[num]) : digits[num];
    sr.send(val);
  };

  sr.segment = function(s) {
    sr.clear();

    var val = commonAnode ? invert(segments[s]) : segments[s];
    sr.send(val);
  };

  sr.clear = function() {
    sr.send( commonAnode ? 255 : 0 );
  };

  var i = 9;

  function next() {
    led.stop();
    sr.digit(i--);

    if (i < 0) {
      i = 9;
      led.strobe(50);
      setTimeout(next, 2000);
    } else {
      setTimeout(next, 1000);
    }

  }

  next();

});