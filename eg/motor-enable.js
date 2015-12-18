var five = require("../lib/johnny-five.js"),
  board = new five.Board();

board.on("ready", function() {
  var motor;
  /*
    // Motors with an enable pin must be initialized with a pins object

    new five.Motor({
      pins: {
        pwm: 3,
        dir: 12,
        enable: 7
      }
    });

   */


  motor = new five.Motor({
    pins: {
      pwm: 3,
      dir: 12,
      enable: 7
    },
    invertPWM: true
  });

  board.repl.inject({
    motor: motor
  });

  motor.on("stop", function() {
    console.log("automated stop on timer", Date.now());
  });

  motor.on("forward", function() {
    console.log("forward", Date.now());

    // enable the motor after 2 seconds
    board.wait(2000, function() {
      motor.enable();
    });
  });

  motor.on("enable", function() {
    console.log("motor enabled", Date.now());

    // enable the motor after 2 seconds
    board.wait(2000, function() {
      motor.stop();
    });
  });

  motor.on("disable", function() {
    console.log("motor disabled", Date.now());
  });


  // disable the motor
  motor.disable();

  // set the motor going forward full speed (nothing happen)
  motor.forward(255);
});
