const { Board, GPS } = require("../lib/johnny-five.js");
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
    const {altitude, latitude, longitude} = position;
    console.log("GPS Position:");
    console.log("  latitude   : ", position.latitude);
    console.log("  longitude  : ", position.longitude);
    console.log("  altitude   : ", position.altitude);
    console.log("--------------------------------------");
  });

  // If speed, course change log it
  gps.on("navigation", velocity => {
    const {course, speed} = velocity;
    console.log("GPS Navigation:");
    console.log("  course  : ", course);
    console.log("  speed   : ", speed);
    console.log("--------------------------------------");
  });
});
