const {Board, GPS} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {

  /*
   * This is the simplest initialization
   * We assume SW_SERIAL0 for the port
   */
  var gps = new GPS({
    pins: {
      rx: 11,
      tx: 10,
    }
  });

  // If latitude, longitude change log it
   gps.on("change", position => {
    console.log("position");
    console.log("  latitude   : ", position.latitude);
    console.log("  longitude  : ", position.longitude);
    console.log("  altitude   : ", position.altitude);
    console.log("--------------------------------------");
  });

  // If speed, course change log it
  gps.on("navigation", velocity => {
    console.log("navigation");
    console.log("  speed   : ", velocity.speed);
    console.log("  course  : ", velocity.course);
    console.log("--------------------------------------");
  });
});
