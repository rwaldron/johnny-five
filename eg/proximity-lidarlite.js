const {Board, Proximity} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const proximity = new Proximity({
    controller: "LIDARLITE"
  });

  proximity.on("change", () => {
    console.log("Proximity: ");
    console.log("  cm  : ", proximity.cm);
    console.log("  in  : ", proximity.in);
    console.log("-----------------");
  });
});
