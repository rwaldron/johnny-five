var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  // The "custom" property is available
  // to all component class constructors
  var sensor = new five.Sensor({
    pin: "A0",
    custom: {
      a: 1,
      b: 2,
    }
  });

  console.log(sensor.custom.a);
  console.log(sensor.custom.b);
});
