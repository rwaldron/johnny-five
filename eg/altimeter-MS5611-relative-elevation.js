var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  // By omitting the base `elevation` property, the values
  // received will be relative to your present elevation
  var altimeter = new five.Altimeter({
    controller: "MS5611",
  });

  altimeter.on("change", function() {
    console.log("Altimeter");
    console.log("  feet         : ", this.feet);
    console.log("  meters       : ", this.meters);
    console.log("--------------------------------------");
  });
});
