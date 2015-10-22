var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  var slider = new five.Sensor("A0");

  slider.scale(0, 100).on("slide", function() {
    console.log(Math.floor(this.value));
  });
});
