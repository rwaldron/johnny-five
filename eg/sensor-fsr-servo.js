var five = require("../lib/johnny-five.js"),
    board, fsr, servo;

board = new five.Board();

board.on("ready", function() {

  // Create a new `fsr` hardware instance.
  fsr = new five.Sensor({
    pin: "A0",
    freq: 25
  });

  servo = new five.Servo(10);

  fsr.scale([ 0, 180 ]).on("read", function() {

    servo.move( this.value );

  });
});
