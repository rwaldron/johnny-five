var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {
  var leds = new five.Leds([2, 3, 4, 5, 6, 7]);
  var tilt = new five.Sensor.Digital(8);
  var i = 0;
  this.loop(1000 * 60 * 10, function() {
    leds[i].on();
    i = (i + 1) % 6;
  });
  tilt.on("change", function() {
    i = 0;
    leds.off();
  });
});
