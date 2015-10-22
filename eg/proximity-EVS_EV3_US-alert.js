var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var red = new five.Led(10);
  var green = new five.Led(11);
  var leds = new five.Leds([red, green]);
  var proximity = new five.Proximity({
    controller: "EVS_EV3_US",
    pin: "BAS1"
  });

  green.on();

  proximity.on("change", function() {
    if (this.cm < 25) {
      if (!red.isOn) {
        leds.toggle();
      }
    } else if (!green.isOn) {
      leds.toggle();
    }
  });
});
