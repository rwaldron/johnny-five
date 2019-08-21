const { Board, Button, ESC, Sensor } = require("../lib/johnny-five");
const board = new Board();

board.on("ready", () => {
  const esc = new ESC({
    device: "FORWARD_REVERSE",
    pin: 11
  });
  const throttle = new Sensor("A0");
  const brake = new Button(4);

  brake.on("press", () => esc.brake());

  throttle.on("change", () => {
    esc.throttle(throttle.scaleTo(esc.pwmRange));
  });
});
