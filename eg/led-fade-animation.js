var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  var led = new five.Led(11);

  led.fade({
    easing: "linear",
    duration: 1000,
    cuePoints: [0, 0.2, 0.4, 0.6, 0.8, 1],
    keyFrames: [0, 250, 25, 150, 100, 125],
    onstop: function() {
      console.log("Animation stopped");
    }
  });

  // Toggle the led after 2 seconds (shown in ms)
  this.wait(2000, function() {
    led.fadeOut();
  });
});
