var five = require("../lib/johnny-five.js"),
    board, sonar;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  // Create a new `sonar` hardware instance.
  // This example allows the sonar module to
  // create a completely default instance
  sonar = new five.Sonar({
    // Setup on Analog 0
    pin: "A0"
  });

  // sonar Event API

  // "read" get the current reading from the sonar
  sonar.on("read", function( err, timestamp ) {
    /*

      this.voltage - raw voltage reading
      this.inches  - calculated distance

    */
    console.log( "Object is " + this.inches + "inches away" );
  });
});
