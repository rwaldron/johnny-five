const { Board, Light } = require("../lib/johnny-five");
const board = new Board();

board.on("ready", () => {
  const light = new Light({
    controller: "TSL2561",
  });

  light.on("data", (data) => {
    console.log("Lux: ", data.lux);
  });
});
