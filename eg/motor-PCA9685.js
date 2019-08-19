const {Board, Motor} = require("../lib/johnny-five.js");

const board = new Board();

/*
 * The PCA9685 controller has been tested on
 * the Adafruit Motor/Stepper/Servo Shield v2
 */

board.on("ready", () => {
  // Create a new `motor` hardware instance.
  const motor = new Motor({
    pins: [8, 9, 10],
    controller: "PCA9685",
    address: 0x60
  });

  // Inject the `motor` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    motor
  });

  // Motor Event API

  // "start" events fire when the motor is started.
  motor.on("start", () => {
    console.log(`start: ${Date.now()}`);

    // Demonstrate motor stop in 2 seconds
    board.wait(2000, motor.stop);
  });

  // "stop" events fire when the motor is started.
  motor.on("stop", () => {
    console.log(`stop: ${Date.now()}`);
  });

  // Motor API

  // start()
  // Start the motor. `isOn` property set to |true|
  motor.start();

});
