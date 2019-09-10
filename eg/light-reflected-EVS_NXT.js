const { Board, Light } = require("../lib/johnny-five");
const board = new Board();

board.on("ready", () => {
  const reflected = new Light({
    controller: "EVS_NXT",
    pin: "BBS1",
    mode: "reflected"
  });

  reflected.on("change", () => {
    console.log("Reflected Light Level: ");
    console.log("  level  : ", reflected.level);
    console.log("-----------------");
  });
});
