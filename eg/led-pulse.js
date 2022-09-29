const { Board, Led } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  // Create a standard `led` component
  // on a valid pwm pin
  const led = new Led(11);

  led.pulse();

  // Stop and turn off the led pulse loop after
  // 10 seconds (shown in ms)
  board.wait(10000, () => {

    // stop() terminates the interval
    // off() shuts the led off
    led.stop().off();
  });
});
