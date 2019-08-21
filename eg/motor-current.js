const {Board, Motor} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  /*
    Arduino Motor Shield R3
      Motor A
        pwm: 3
        dir: 12
        brake: 9
        current: "A0"

      Motor B
        pwm: 11
        dir: 13
        brake: 8
        current: "A1"

   */

  const motor = new Motor({
    pins: {
      pwm: 3,
      dir: 12,
      brake: 9
    },

    // The current options are passed to a new instance of Sensor
    current: {
      pin: "A0",
      freq: 250,
      threshold: 10
    }
  });

  board.repl.inject({
    motor
  });

  motor.current.scale([0, 3030]).on("change", () => {
    console.log(`Motor A: ${motor.current.value.toFixed(2)}mA`);
  });

  motor.on("start", () => {
    console.log(`start: ${Date.now()}`);
  });

  motor.on("stop", () => {
    console.log(`automated stop on timer: ${Date.now()}`);
  });

  motor.on("brake", () => {
    console.log(`automated brake on timer: ${Date.now()}`);
  });

  motor.on("forward", () => {
    console.log(`forward: ${Date.now()}`);

    // demonstrate switching to reverse after 5 seconds
    board.wait(5000, () => motor.reverse(150));
  });

  motor.on("reverse", () => {
    console.log(`reverse: ${Date.now()}`);

    // demonstrate stopping after 5 seconds
    board.wait(5000, () => motor.brake(500));
  });

  // set the motor going forward full speed
  motor.forward(255);
});
