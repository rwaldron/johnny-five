var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  /*
   * Explicitly setting HW_SERIAL1 for the port
   */
  var gps = new five.GPS({
    port: this.io.SERIAL_PORT_IDs.HW_SERIAL1
  });

  // If latitude, longitude, course or speed change log it
  gps.on("change", function() {
    console.log("position");
    console.log("  latitude   : ", this.latitude);
    console.log("  longitude  : ", this.longitude);
    console.log("--------------------------------------");
  });
});
