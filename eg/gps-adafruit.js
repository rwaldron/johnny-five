var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  /*
   * This is the simplest initialization
   * We assume SW_SERIAL0 for the port
   */
  var gps = new five.GPS({
    breakout: "ADAFRUIT_ULTIMATE_GPS",
    pins: {tx: 10, rx: 11}
  });

  // If lat, long, course or speed change log it
  gps.on("change", function() {
    console.log(this.latitude, this.longitude);
  });

});
