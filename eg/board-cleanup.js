const { Board, Led } = require("../lib/johnny-five");
const board = new Board();

board.on("ready", () => {
  const led = new Led(13);
  led.on();


  board.on("exit", () => {
    led.off();
  });
});
