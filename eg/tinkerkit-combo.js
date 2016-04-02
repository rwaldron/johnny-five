var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var accel = new five.Accelerometer({
    id: "accelerometer",
    pins: ["I0", "I1"]
  });

  var slider = new five.Sensor({
    id: "slider",
    pin: "I2"
  });

  var servos = new five.Servos([
    {
      id: "servo",
      pin: "O0",
      type: "continuous"
    },
    {
      id: "servo",
      pin: "O0",
      type: "continuous"
    }
  ]);

  slider.scale(0, 180).on("change", function() {
    servos.to(this.value);
  });

  accel.on("acceleration", function() {
    // console.log( this.raw.x, this.raw.y );
  });
});
