const { Altimeter, Board } = require("../");
const board = new Board();

board.on("ready", () => {
  // By omitting the base `elevation` property, the values
  // received will be relative to your present elevation
  const altimeter = new Altimeter({
    controller: "BMP180"
  });

  altimeter.on("change", () => {
    const {feet, meters} = altimeter;
    console.log("Altimeter:");
    console.log("  feet         : ", feet);
    console.log("  meters       : ", meters);
    console.log("--------------------------------------");
  });
});

