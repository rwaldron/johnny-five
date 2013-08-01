var five = require("./lib/johnny-five.js"),
  board, gyro;

board = new five.Board();

board.on("ready", function() {
  var collection = [];
  // Create a new `Gyroscope` hardware instance.

  gyro = new five.Gyroscope({
    pins: [ "I0", "I1" ],
    freq: 200,
    extent: 4
  });

  gyro.on("acceleration", function( err, data ) {
    console.log(data.position);
  });
});