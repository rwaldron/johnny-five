var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var virtual = new five.Board.Virtual(
    new five.Expander("LIS3DH")
  );

  var sensor = new five.Sensor({
    pin: "A2",
    board: virtual
  });

  sensor.on("data", function() {
    console.log(sensor.value);
  });
});
