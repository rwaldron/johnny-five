var five = require("../lib/johnny-five.js"),
    board, ping;

board = new five.Board();

board.on("ready", function() {

  // Create a new `ping` hardware instance.
  ping = new five.Ping(7);

  // Properties

  // ping.microseconds
  //
  // Roundtrip distance in microseconds
  //

  // ping.inches
  //
  // Calculated distance to object in inches
  //

  // ping.cm
  //
  // Calculated distance to object in centimeters
  //


  // Ping Event API

  // "read" get the current reading from the ping
  ping.on("read", function( err, value ) {
    console.log( "read", value );
  });

  ping.on("change", function( err, value ) {

    console.log( typeof this.inches );
    console.log( "Object is " + this.inches + "inches away" );
  });
});
