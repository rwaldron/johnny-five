const { Board, Led } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const led = new Led(11);

  led.fadeIn();

  // Toggle the led after 5 seconds (shown in ms)
  board.wait(5000, () => {
    led.fadeOut();
  });
});
