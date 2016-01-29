var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var leds = new five.Leds([2, 3, 4, 5, 6]);
  var pot = new five.Sensor("A0");

  pot.scale([-1, 4]).on("change", function() {
    var lastIndex = Math.round(this.value);

    if (lastIndex === -1) {
      leds.off();
    } else {
      leds.each(function(led, index) {
        if (index <= lastIndex) {
          led.on();
        } else {
          led.off();
        }
      });
    }
  });
});
