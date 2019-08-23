const {Board, Thermometer} = require("../lib/johnny-five");
const board = new Board();

board.on("ready", () => {
  const temp = new Thermometer({
    controller: "BMP085"
  });

  temp.on("change", () => {
    console.log(`Thermometer
  celsius      : ${temp.celsius}
  fahrenheit   : ${temp.fahrenheit}
  kelvin       : ${temp.kelvin}
--------------------------------------`);
  });
});
