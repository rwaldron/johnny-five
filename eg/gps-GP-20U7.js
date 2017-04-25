var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var gps = new five.GPS({
    pins: {
      rx: 11,
      tx: 10,
    }
  });

  // If latitude, longitude data log it.
  // This will output zero until a valid
  // GPS position is detected.
  gps.on("data", function() {
    console.log("position");
    console.log("  latitude   : ", this.latitude);
    console.log("  longitude  : ", this.longitude);
    console.log("  altitude   : ", this.altitude);
    console.log("--------------------------------------");
  });
});
