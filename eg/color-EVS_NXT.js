const {Board, Color} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const color = new Color({
    controller: "EVS_NXT",
    pin: "BBS2"
  });

  color.on("change", () => {
    console.log("Color:");
    console.log("  rgb     : ", color.rgb);
    console.log("--------------------------------------");
  });
});
