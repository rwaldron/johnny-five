const {Board, GPS} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const gps = new GPS({
    pins: {
      rx: 11,
      tx: 10,
    }
  });

  // If latitude, longitude data log it.
  // This will output zero until a valid
  // GPS position is detected.
  gps.on("data", position => {
    console.log("position");
    console.log("  latitude   : ", position.latitude);
    console.log("  longitude  : ", position.longitude);
    console.log("  altitude   : ", position.altitude);
    console.log("--------------------------------------");
  });
});