const { Board, Compass } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const compass = new Compass({
    controller: "HMC5883L"
  });

  compass.on("change", () => {
    const {bearing, heading} = compass;
    console.log("Compass:");
    console.log("  bearing     : ", bearing);
    console.log("  heading     : ", heading);
    console.log("--------------------------------------");
  });
});
