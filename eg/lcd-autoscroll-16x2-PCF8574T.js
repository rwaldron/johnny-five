var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var l = new five.LCD({
    controller: "PCF8574T"
  });

  l.cursor(0, 0);
  l.autoscroll();

  var number = 0;
  var interval = setInterval(_ => {
    l.print(number++);

    if (number === 10) {
      number = 0;
    }
  }, 100);
});
