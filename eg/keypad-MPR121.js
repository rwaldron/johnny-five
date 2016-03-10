var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var touchpad = new five.Touchpad({
    controller: "MPR121"
  });

  ["change", "press", "hold", "release"].forEach(function(eventType) {
    touchpad.on(eventType, function(event) {
      console.log("Event: %s, Target: %s", eventType, event.which);
    });
  });
});
