const { Board, Light } = require("../lib/johnny-five");
const board = new Board();

board.on("ready", () => {
  const light = new Light({
    controller: "EVS_EV3",
    pin: "BAS1"
  });

  light.on("change", (data) => {
    console.log("Ambient Light Level: ", data.level);
  });
});
