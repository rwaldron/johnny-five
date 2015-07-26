var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var laser = new five.Led(9);
  var detection = new five.Sensor("A0");
  var isSecure = false;

  laser.on();

  detection.scale(0, 1).on("change", function() {
    var reading = !(this.value | 0);

    if (isSecure !== reading) {
      isSecure = reading;

      if (!isSecure) {
        console.log("Intruder");
      }
    }
  });
});
