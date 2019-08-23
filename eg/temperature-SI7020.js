const {Board, Thermometer} = require("../lib/johnny-five.js");
const Tessel = require("tessel-io");

const board = new Board({
  io: new Tessel()
});

board.on("ready", () => {
  const temp = new Thermometer({
    controller: "SI7020",
    port: "A"
  });

  temp.on("change", () => {
    console.log(`${temp.celsius}°C ${temp.fahrenheit}°F`);
  });
});
