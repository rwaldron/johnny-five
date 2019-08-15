const { Board, ESC, Sensor } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const esc = new ESC({
    controller: "PCA9685",
    device: "FORWARD",
    pin: 1
  });

  const pot = new Sensor("A0");

  pot.on("change", () => {
    esc.throttle(pot.scaleTo(esc.pwmRange));
  });
});
