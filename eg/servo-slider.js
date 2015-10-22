var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  var slider = new five.Sensor("A0");
  var tilt = new five.Servo(9);

  slider.scale([0, 180]).on("slide", function() {

    // The slider's value will be scaled to match the tilt servo range
    tilt.to(this.value);
  });
});
