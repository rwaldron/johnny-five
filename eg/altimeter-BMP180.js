const { Altimeter, Board } = require("../");
const board = new Board();

board.on("ready", () => {
  // By including a base `elevation` property, the values
  // received will be absolute elevation (from sealevel)
  const altimeter = new Altimeter({
    controller: "BMP180",
    // Change `elevation` with whatever is reported
    // on http://www.whatismyelevation.com/.
    // `12` is the elevation (meters) for where I live in Brooklyn
    elevation: 12
  });

  altimeter.on("change", () => {
    const {feet, meters} = altimeter;
    console.log("Altimeter:");
    console.log("  feet         : ", feet);
    console.log("  meters       : ", meters);
    console.log("--------------------------------------");
  });
});

