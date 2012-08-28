var five = require("../lib/johnny-five.js"),
    board, photoresistor;

board = new five.Board();

board.on("ready", function() {

  // Create a new `photoresistor` hardware instance.
  photoresistor = new five.Sensor({
    pin: "A2",
    freq: 250
  });

  // Inject the `sensor` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    pot: photoresistor
  });

  // "read" get the current reading from the photoresistor
  photoresistor.on("read", function( err, value ) {
    console.log( value, this.normalized );
  });
});


// References
//
// http://nakkaya.com/2009/10/29/connecting-a-photoresistor-to-an-arduino/
