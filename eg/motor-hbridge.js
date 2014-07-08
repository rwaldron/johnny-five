/*
  IMPORTANT!!! This example is not intended for off the shelf
  H-Bridge based motor controllers. It is for home made H-Bridge
  controllers. Off the shelf controllers abstract away the need
  to invert the PWM (AKA Speed) value when the direction pin is set 
  to high. This is for controllers that do not have that feature.
*/

var five = require("../lib/johnny-five.js"),
  board = new five.Board();

board.on("ready", function() {
  var motor;
  /*
      Motor A
        pwm: 3
        dir: 12
   */


  motor = new five.Motor({
    pins: {
      pwm: 3,
      dir: 12
    },
    invertPWM: true
  });




  board.repl.inject({
    motor: motor
  });

  motor.on("start", function(err, timestamp) {
    console.log("start", timestamp);
  });

  motor.on("stop", function(err, timestamp) {
    console.log("automated stop on timer", timestamp);
  });

  motor.on("forward", function(err, timestamp) {
    console.log("forward", timestamp);

    // demonstrate switching to reverse after 5 seconds
    board.wait(5000, function() {
      motor.reverse(50);
    });
  });

  motor.on("reverse", function(err, timestamp) {
    console.log("reverse", timestamp);

    // demonstrate stopping after 5 seconds
    board.wait(5000, function() {
      motor.stop();
    });
  });

  // set the motor going forward full speed
  motor.forward(255);
});
