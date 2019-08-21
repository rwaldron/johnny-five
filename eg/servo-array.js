const {Board, Servos} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {

  // Initialize a Servo collection
  const servos = new Servos([9, 10]);

  servos.center();

  // Inject the `servo` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    servos
  });


  // min()
  //
  // set all servos to the minimum degrees
  // defaults to 0
  //
  // eg. servos.min();

  // max()
  //
  // set all servos to the maximum degrees
  // defaults to 180
  //
  // eg. servos.max();

  // to( deg )
  //
  // set all servos to deg
  //
  // eg. servos.to( deg );

  // step( deg )
  //
  // step all servos by deg
  //
  // eg. servos.step( -20 );

  // stop()
  //
  // stop all servos
  //
  // eg. servos.stop();

  // each( callbackFn )
  //
  // Execute callbackFn for each active servo instance
  //
  // eg.
  // servos.each(function( servo, index ) {
  //
  //  `this` refers to the current servo instance
  //
  // });

});
