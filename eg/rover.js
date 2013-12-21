var five = require("../lib/johnny-five.js");

board = new five.Board();

board.on("ready", function() {

  rover = new five.Rover({
    right: 10,
    left: 11
  });

  this.repl.inject({
    rover: rover
  });

  rover.on("ready", function() {

    console.log('rover is ready...');

    // Move forward for 2 seconds
    // Pivot right for 1 second
    rover.forward();
    setTimeout(function(){
      rover.right(1000);
    }, 2000);

    // Stop after 5 total seconds
    setTimeout(function(){
      rover.stop();
    }, 5000);

  });
});
