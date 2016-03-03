var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var led = new five.Led(13);
  led.on();


  this.on("exit", function() {
    led.off();
  });
});
