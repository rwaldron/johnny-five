var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var rgb = new five.Led.RGB([6, 5, 3]);
  var rainbow = ["FF0000", "FF7F00", "00FF00", "FFFF00", "0000FF", "4B0082", "8F00FF"];
  var index = 0;

  setInterval(function() {
    if (index + 1 === rainbow.length) {
      index = 0;
    }
    rgb.color(rainbow[index++]);
  }, 500);
});
