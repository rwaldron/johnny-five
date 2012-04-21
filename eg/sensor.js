var five = require("../lib/johnny-five.js"),
    board, sensor;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  // Create a new `sensor` hardware instance.
  // This example allows the sensor module to
  // create a completely default instance
  sensor = new five.Sensor({
    pin: "A0"
  });

  // Inject the `sensor` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    sensor: sensor
  });

  // sensor Event API

  // "read" get the current reading from the sensor
  sensor.on("read", function( err, value ) {
    console.log( value );
  });
});
