const {Board, Switch, Sensor, Motor} = require("johnny-five");
const Tessel = require("tessel-io");
const board = new Board({
  io: new Tessel()
});

board.on("ready", () => {
  const spdt = new Switch("a0");
  const throttle = new Sensor("b0");

  // See the comments below for more information about
  // the pins shown in this pin array argument.
  const motor = new Motor([ "a5", "a4", "a3" ]);

  spdt.on("open", () => {
    motor.stop().forward(motor.speed());
  });

  spdt.on("close", () => {
    motor.stop().reverse(motor.speed());
  });

  throttle.on("change", () => {
    motor.speed(throttle.value >> 2);
  });
});
/* @markdown

Here's a breakdown of the pins used by these motor drivers, their corresponding Johnny-Five Motor class pin name, and capabilities:

| Control Type/Role | Johnny-Five Motor Pin Name | Breakout Printed Pin |
| ----------------- | -------------------------- | -------------------- |
| PWM               | `pwm`                      | `PWMA` or `PWMB`     |
| Counter Direction | `cdir`                     | `AIN2` or `BIN2`     |
| Direction         | `dir`                      | `AIN1` or `BIN1`     |


@markdown */
