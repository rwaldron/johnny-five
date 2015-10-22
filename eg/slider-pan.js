var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  var range = [0, 170];
  var slider = new five.Sensor("A0");
  var tilt = new five.Servo({
    pin: 10,
    range: range
  });

  slider.scale(range).on("slide", function() {

    // The slider's value will be scaled to match the tilt servo range
    tilt.to(this.value);
  });
});
