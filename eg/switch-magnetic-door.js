var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  // Contact Mode: Normally Open (default!)
  var sw = new five.Switch(7);

  sw.on("open", function() {
    console.log("open");
  });

  sw.on("close", function() {
    console.log("close");
  });
});
