var five = require("../lib/johnny-five.js"),
    boards;

boards = [
  new five.Board({ id: "a" }),
  new five.Board({ id: "b" })
];

// Add ready event handlers to both boards.
boards.forEach(function( board ) {
  board.on("ready", function() {
    var val = 0;

    console.log( "ready!!!!!" );

    // Set pin 13 to OUTPUT mode
    this.pinMode( 13, 1 );

    // Create a loop to "flash/blink/strobe" an led
    this.loop( 50, function() {
      this.digitalWrite( 13, (val = val ? 0 : 1) );
    });
  });
});
