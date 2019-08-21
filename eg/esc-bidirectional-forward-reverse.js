const { Board, Button, ESC, Sensor } = require("../lib/johnny-five");
const board = new Board();

board.on("ready", () => {
  const start = Date.now();
  const esc = new ESC({
    device: "FORWARD_REVERSE",
    neutral: 50,
    pin: 11
  });
  const throttle = new Sensor("A0");
  const brake = new Button(4);

  brake.on("press", () => esc.brake());

  throttle.scale(0, 100).on("change", () => {
    // 2 Seconds for arming.
    if (Date.now() - start < 2000) {
      return;
    }

    esc.throttle(this.value);
  });
});
