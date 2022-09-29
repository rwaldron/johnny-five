const { Barometer, Board } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const barometer = new Barometer({
    controller: "MS5611"
  });

  barometer.on("change", () => {
    console.log("Barometer:");
    console.log("  pressure     : ", barometer.pressure);
    console.log("--------------------------------------");
  });
});
