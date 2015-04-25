var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  // Set up the following PWM pins as LEDs.
  // Fade an LED out, and the complete callback will start
  // fading the next LED in sequence out, and so on.
  // If randomFade is true, then fading will happen in random
  // order instead of sequentially.
  var leds = new five.Leds([11, 10, 9, 6, 5, 3]);
  var timing = 250;
  var randomFade = true;
  var fadeIndex = 0;
  var ledCount = leds.length;
  var i;

  function fadeNext() {
    var candidateIndex = fadeIndex;
    leds[fadeIndex].fadeIn(timing);

    // Determine the next LED to fade
    if (randomFade) {
      while (candidateIndex === fadeIndex) {
        candidateIndex = Math.round(Math.random() * (ledCount - 1));
      }
    } else {
      candidateIndex = (fadeIndex < ledCount - 1) ? fadeIndex + 1 : 0;
    }
    fadeIndex = candidateIndex;

    leds[fadeIndex].fadeOut(timing, fadeNext);
  }

  leds.on();
  leds[fadeIndex].fadeOut(timing, fadeNext);
});
