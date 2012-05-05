var five = require("../lib/johnny-five.js"),
    board, sensor;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  // Create a new `sensor` hardware instance.
  sensor = new five.Sensor({
    pin: "A0",
    freq: 250
  });

  // Inject the `sensor` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    sensor: sensor
  });

  // sensor Event API

  // "read" get the current reading from the sensor
  sensor.scale([ 0, 100 ]).on("read", function() {
    console.log( this.normalized, this.constrained, this.scaled );
  });
});

// Tutorials
//
// http://protolab.pbworks.com/w/page/19403657/TutorialSensors
