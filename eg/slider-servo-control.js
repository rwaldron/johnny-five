var five = require("../lib/johnny-five.js"),
  board, slider, servo, scalingRange;

board = new five.Board();

board.on("ready", function() {

  scalingRange = [0, 170];

  slider = new five.Sensor({
    pin: "A0",
    freq: 50
  });

  servo = new five.Servo({
    pin: 9,
    range: scalingRange
  });


  // The slider's value will be scaled to match the servo's movement range

  slider.scale(scalingRange).on("slide", function(err, value) {

    servo.to(Math.floor(this.value));

  });
});
