const Barcli = require("barcli");
const { Board, Expander, Sensor } = require("../lib/johnny-five.js");
const board = new Board({
  repl: false,
  debug: false,
});

board.on("ready", function() {

  // Use an Expander instance to create
  // a virtual Board.
  const virtual = new Board.Virtual(
    new Expander("CD74HC4067")
  );

  const inputs = ["A0", "A7", "A15"];

  inputs.forEach(pin => {

    const bar = new Barcli({
      label: pin,
      range: [0, 1023]
    });

    // Initialize a Sensor instance with
    // the virtual board created above
    const sensor = new Sensor({
      board: virtual,
      pin,
    });

    // Display all changes in the terminal
    // as a Barcli chart graph
    sensor.on("change", () => {
      bar.update(sensor.value);
    });
  });
});
