const { Board, Proximity } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", function() {
  const proximity = new Proximity({
    controller: "GP2Y0A21YK",
    pin: "A0"
  });

  proximity.on("change", function() {
    const {centimeters, inches} = proximity;
    console.log("Proximity: ");
    console.log("  cm  : ", centimeters);
    console.log("  in  : ", inches);
    console.log("-----------------");
  });
});
