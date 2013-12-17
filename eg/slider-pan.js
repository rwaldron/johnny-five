var five = require("../lib/johnny-five.js"),
  board, slider, tilt, scalingRange;

board = new five.Board();

board.on("ready", function() {

  scalingRange = [0, 170];

  slider = new five.Sensor({
    pin: "A0",
    freq: 50
  });

  tilt = new five.Servo({
    pin: 9,
    range: scalingRange
  });

  slider.scale(scalingRange).on("slide", function(err, value) {

    // The slider's value will be scaled to match the tilt servo range

    tilt.to(Math.floor(this.value));

  });
});
