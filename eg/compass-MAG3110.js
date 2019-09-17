const { Board, Compass } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const compass = new Compass({
    controller: "MAG3110",
    // Optionally pre-load the offsets
    offsets: {
      x: [-819, -335],
      y: [702, 1182],
      z: [-293, -13],
    },
  });

  compass.on("calibrated", offsets => {
    // Use this data with the optional "offsets" property above
    // console.log("calibrated:", offsets);
  });

  compass.on("change", () => {
    const {bearing, heading} = compass;
    console.log("Compass:");
    console.log("  bearing     : ", bearing);
    console.log("  heading     : ", heading);
    console.log("--------------------------------------");
  });
});
