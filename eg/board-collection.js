const { Boards, Led } = require("../lib/johnny-five.js");
const boards = new Boards([
  "/dev/tty.usbmodem14101",
  "/dev/tty.wchusbserial1420",
]);

const pin = 13;

boards.on("ready", () => {
  boards.each(board => new Led({board, pin}).blink());
});
