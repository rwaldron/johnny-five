var five = require("../lib/johnny-five.js"),
    board, pir;

board = five.Board();

board.on("ready", function() {

  // Create a new `pir` hardware instance.
  pir = five.Pir({
    pin: 7
  });

  // Inject the `pir` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    pir: pir
  });

  // Pir Event API

  // "calibrated" occurs once, at the beginning of a session,
  pir.on("calibrated", function( err, date ) {
    console.log( "calibrated", date );
  });

  // "motionstart" events are fired when the "calibrated"
  // proximal area is disrupted, generally by some form of movement
  pir.on("motionstart", function( err, date ) {
    console.log( "motionstart", date );
  });

  // "motionstart" events are fired following a "motionstart event
  // when no movement has occurred in X ms
  pir.on("motionend", function( err, date ) {
    console.log( "motionend", date );
  });
});
