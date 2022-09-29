const {Board, Led, Switch} = require("johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const spdt = new Switch(8);
  const led = new Led(13);
  
  spdt.on("open", () => led.off());
  spdt.on("close", () => led.on());
});
