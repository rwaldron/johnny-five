const {Board, Switch} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  // Contact Mode: Normally Open (default!)
  const sw = new Switch(7);
  sw.on("open", () => console.log("open"));
  sw.on("close", () => console.log("close"));
});
