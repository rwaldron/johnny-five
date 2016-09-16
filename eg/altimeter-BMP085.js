var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  // By including a base `elevation` property, the values
  // received will be absolute elevation (from sealevel)
  var altimeter = new five.Altimeter({
    controller: "BMP085",
    // Change `elevation` with whatever is reported
    // on http://www.whatismyelevation.com/.
    // `12` is the elevation (meters) for where I live in Brooklyn
    elevation: 12,
  });

  altimeter.on("change", function() {
    console.log("Altimeter");
    console.log("  feet         : ", this.feet);
    console.log("  meters       : ", this.meters);
    console.log("--------------------------------------");
  });
});
