const {Board, Motor} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
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

  const motor = new Motor({
    pins: {
      pwm: 3,
      dir: 12,
      enable: 7
    },
    invertPWM: true
  });

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

  // disable the motor
  motor.disable();

  // set the motor going forward full speed (nothing happen)
  motor.forward(255);
});
