const {Board, Motor} = require("../lib/johnny-five.js");
const Edison = require("galileo-io");
const board = new Board({
  io: new Edison()
});

board.on("ready", () => {
  const config = Motor.SHIELD_CONFIGS.SPARKFUN_DUAL_HBRIDGE_EDISON_BLOCK;
  const motor = new Motor(config.B);

  board.repl.inject({
    motor
  });

  motor.on("stop", () => {
    console.log(`automated stop on timer: ${Date.now()}`);
  });

  motor.on("forward", () => {
    console.log(`forward: ${Date.now()}`);

    // enable the motor after 2 seconds
    board.wait(2000, motor.enable);
  });

  motor.on("enable", () => {
    console.log(`motor enabled: ${Date.now()}`);

    // enable the motor after 2 seconds
    board.wait(2000, motor.stop);
  });

  motor.on("disable", () => {
    console.log(`motor disabled: ${Date.now()}`);
  });


  // // disable the motor
  motor.disable();

  // set the motor going forward full speed (nothing happen)
  motor.forward(255);
});
