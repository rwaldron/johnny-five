var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var proximity = new five.Proximity({
    controller: "GP2Y0A41SK0F",
    pin: "A0",
    filter: {
      samples: 5,
      soften: 2,
      deviation: 2
    }
  });

  proximity.on("data", function() {
    console.log("Proximity: ");
    console.log("  cm  : ", this.cm);
    console.log("  in  : ", this.in);
    console.log("-----------------");
  });

  proximity.on("change:filtered", function() {
    console.log("The obstruction has moved.");
  });

});
