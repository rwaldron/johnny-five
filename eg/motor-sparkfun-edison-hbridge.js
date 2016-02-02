var five = require("../lib/johnny-five.js");
var Edison = require("galileo-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {
  var config = five.Motor.SHIELD_CONFIGS.SPARKFUN_DUAL_HBRIDGE_EDISON_BLOCK;
  var motor = new five.Motor(config.B);

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


  // // disable the motor
  motor.disable();

  // set the motor going forward full speed (nothing happen)
  motor.forward(255);
});
