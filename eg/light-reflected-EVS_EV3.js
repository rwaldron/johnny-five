const { Board, Light } = require("../lib/johnny-five");
const board = new Board();

board.on("ready", () => {
  const reflected = new Light({
    controller: "EVS_EV3",
    pin: "BAS1",
    mode: "reflected"
  });

  reflected.on("change", () => {
    console.log("Reflected Light Level: ");
    console.log("  level  : ", reflected.level);
    console.log("-----------------");
  });
});
