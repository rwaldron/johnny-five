const { Board, Light } = require("../lib/johnny-five");
const board = new Board();

board.on("ready", () => {
  const ambient = new Light({
    controller: "TSL2561",
  });

  ambient.on("change", () => {
    console.log("Ambient Light Level: ");
    console.log("  level  : ", ambient.level);
    console.log("-----------------");
  });
});
