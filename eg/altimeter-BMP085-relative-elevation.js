const { Altimeter, Board } = require("../");
const board = new Board();

board.on("ready", () => {
  // By omitting the base `elevation` property, the values
  // received will be relative to your present elevation
  const altimeter = new Altimeter({
    controller: "BMP085"
  });

  altimeter.on("change", () => {
    console.log("Altimeter");
    console.log("  feet         : ", altimeter.feet);
    console.log("  meters       : ", altimeter.meters);
    console.log("--------------------------------------");
  });
});
