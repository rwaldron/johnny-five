const { Board, GPS } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {

  /*
   * This is the simplest initialization
   * We assume SW_SERIAL0 for the port
   */
  const gps = new GPS({
    breakout: "ADAFRUIT_ULTIMATE_GPS",
    pins: {
      rx: 11,
      tx: 10,
    }
  });

  // If latitude, longitude, course or speed change log it
  gps.on("change", position => {
    const {latitude, longitude} = position;
    console.log("GPS Position:");
    console.log("  latitude   : ", latitude);
    console.log("  longitude  : ", longitude);
    console.log("--------------------------------------");
  });
});
