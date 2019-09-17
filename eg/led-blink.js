const { Board, Led } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const led = new Led(13);

  // "blink" the led in 500ms on-off phase periods
  led.blink(500);
});
