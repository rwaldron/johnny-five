const { Board, Light } = require("../lib/johnny-five");
const board = new Board();

board.on("ready", () => {
  const reflect = new Light({
    controller: "EVS_EV3",
    pin: "BAS1",
    mode: "reflected"
  });

  reflect.on("change", (data) => {
    console.log("Light Reflection Level: ", data.level);
  });
});
