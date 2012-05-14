var five = require("../lib/johnny-five.js"),
    board, slider, servo, range;

board = new five.Board();

board.on("ready", function() {

  // The Servo class defaults to the standard 180°,
  // This example program is intended to run with a
  // 90° digital servo.
  range = [ 0, 90 ];

  // Create a new servo instance on PWM 10, w/ a 0-90° range
  servo = new five.Servo({
    pin: 10,
    range: range
  });

  // °
  slider = new five.Sensor({
    pin: "A0",
    freq: 50
  });


  // Scale the slider's value to fit in the servo's
  // movement range. When the slider position changes
  // update the servo's position
  slider.scale( range ).on( "slide", function() {

    servo.move( Math.floor(this.value) );

  });
});
