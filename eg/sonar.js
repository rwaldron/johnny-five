var five = require("../lib/johnny-five.js"),
    board, sonar;

board = new five.Board();

board.on("ready", function() {

  // Create a new `sonar` hardware instance.
  sonar = new five.Sonar("A2");

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
  // "read" fired continuously
  //
  sonar.on("read", function( err, timestamp ) {
    /*

      this.voltage - raw voltage reading
      this.inches  - calculated distance, inches
      this.cm  - calculated distance, centimeters

    */
    console.log( "read", "Object is " + this.inches + "inches away" );
  });

  //
  // "change" fired when distance reading changes
  //
  sonar.on("change", function( err, timestamp ) {
    console.log( "change", "Object is " + this.inches + "inches away" );
  });
});
