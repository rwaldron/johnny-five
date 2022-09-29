const { Board, Proximity } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const proximity = new Proximity({
    controller: "HCSR04",
    pin: 7
  });

  proximity.on("change", () => {
    const {centimeters, inches} = proximity;
    console.log("Proximity: ");
    console.log("  cm  : ", centimeters);
    console.log("  in  : ", inches);
    console.log("-----------------");
  });
});
