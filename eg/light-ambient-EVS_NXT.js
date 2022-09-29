const { Board, Light } = require("../lib/johnny-five");
const board = new Board();

board.on("ready", () => {
  const ambient = new Light({
    controller: "EVS_NXT",
    pin: "BAS2"
  });

  ambient.on("change", () => {
    console.log("Ambient Light Level: ");
    console.log("  level  : ", ambient.level);
    console.log("-----------------");
  });
});
