const { Board, Led } = require("../lib/johnny-five");
const board = new Board();

// The board's pins will not be accessible until
// the board has reported that it is ready
board.on("ready", () => {
  console.log("Ready!");

  const led = new Led(13);
  led.blink(500);
});
