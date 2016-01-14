var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  var escs = new five.ESCs([9, 10]);

  // Set the motors to their max speed
  escs.max();

  board.wait(2000, function() {
    // Set the motors to the min speed (stopped)
    escs.min();
  });

});
