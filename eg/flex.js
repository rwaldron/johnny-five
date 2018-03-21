var five = require("../lib/johnny-five.js"),
  board, flex;

board = new five.Board();

board.on("ready", function() {

  // Create a new `flex sensor` hardware instance.
  flex = new five.Sensor({
    pin: "A2",
    freq: 250
  });

  // Inject the `sensor` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    pot: flex
  });

  // "data" get the current reading from the flex sensor
  flex.on("data", function() {
    console.log(this.value);
  });
});
