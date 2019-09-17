const Barcli = require("barcli");
const { Board, Expander, Sensor } = require("../lib/johnny-five");
const board = new Board();

board.on("ready", () => {
  const virtual = new Board.Virtual(
    new Expander("ADS1115")
  );

  virtual.io.analogPins.forEach(pin => {

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
