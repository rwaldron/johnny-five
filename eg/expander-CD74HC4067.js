var Barcli = require("barcli");
var five = require("../lib/johnny-five.js");
var board = new five.Board({
  repl: false,
  debug: false,
});

board.on("ready", function() {

  // Use an Expander instance to create
  // a virtual Board.
  var virtual = new five.Board.Virtual(
    new five.Expander("CD74HC4067")
  );

  var inputs = ["A0", "A7", "A15"];

  inputs.forEach(function(input) {

    var bar = new Barcli({ label: input, range: [0, 1023] });

    // Initialize a Sensor instance with
    // the virtual board created above
    var sensor = new five.Sensor({
      pin: input,
      board: virtual
    });

    // Display all changes in the terminal
    // as a Barcli chart graph
    sensor.on("change", function() {
      bar.update(this.value);
    });
  });
});
