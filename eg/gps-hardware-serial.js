const {Board, GPS} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {

  /*
   * Explicitly setting HW_SERIAL1 for the port
   */
  const gps = new GPS({
    port: board.io.SERIAL_PORT_IDs.HW_SERIAL1
  });

  // If latitude, longitude, course or speed change log it
  gps.on("change", position => {
    console.log("position");
    console.log("  latitude   : ", position.latitude);
    console.log("  longitude  : ", position.longitude);
    console.log("--------------------------------------");
  });
});
