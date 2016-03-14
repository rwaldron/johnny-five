var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  /*
   * Explicitly setting HW_SERIAL1 for the port
   */
  var gps = new five.GPS({
    port: this.io.SERIAL_PORT_IDs.HW_SERIAL1
  });

  // If lat, long, course or speed change log it
  gps.on("change", function() {
    console.log(this.latitude, this.longitude);
  });

});
