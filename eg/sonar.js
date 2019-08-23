const {Board, Sonar} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {

  // Create a new `sonar` hardware instance.
  const sonar = new Sonar("A2");

  // Sonar Properties

  // sonar.voltage
  //
  // Raw voltage
  //

  // sonar.inches
  //
  // Distance reading in inches
  //

  // sonar.cm
  //
  // Distance reading in centimeters
  //


  // Sonar Event API
  //
  // "data" fired continuously
  //
  sonar.on("data", () => {
    /*

      this.voltage - raw voltage reading
      this.inches  - calculated distance, inches
      this.cm  - calculated distance, centimeters

    */
    console.log("data", "Object is " + sonar.inches + "inches away");
  });

  //
  // "change" fired when distance reading changes
  //
  sonar.on("change", function() {
    console.log("change", "Object is " + sonar.inches + "inches away");
  });
});
