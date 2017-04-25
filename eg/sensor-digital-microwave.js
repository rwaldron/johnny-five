var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", () => {
  var microwave = new five.Sensor.Digital(7);

  microwave.on("change", () => {
    console.log(microwave.value);
  });
});
