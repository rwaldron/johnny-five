const {Board, Motor} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {

  // You can configure with explicit pins settings
  const m1 = new Motor({
    pins: {
      pwm: 9,
      dir: 2,
      cdir: 4,
      enable: 6
    }
  });

  // Or you can configure using the built in configs
  const m2 = new Motor(Motor.SHIELD_CONFIGS.POLOLU_VNH5019_SHIELD.M2);

  // Inject the `motor` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    m1,
    m2
  });

  // "start" events fire when the motor is started.
  [m1, m2].forEach((motor, index) => {
    motor.on("start", () => {
      console.log(`start motor ${index+1}`);

      // Demonstrate motor stop in 2 seconds
      board.wait(2000, motor.stop);
    });
  });

  [m1, m2].forEach( motor => {

    // "stop" events fire when the motor is stopped.
    motor.on("stop", () => console.log("stop"));
  });

  // Motor API

  // start([speed)
  // Start the motor. `isOn` property set to |true|
  // Takes an optional parameter `speed` [0-255]
  // to define the motor speed if a PWM Pin is
  // used to connect the motor.
  m1.start();
  m2.start();

  // stop()
  // Stop the motor. `isOn` property set to |false|
});
