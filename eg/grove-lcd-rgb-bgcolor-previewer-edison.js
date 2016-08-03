var five = require("../");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});
var colors = Object.keys(require("css-color-names"));

board.on("ready", () => {
  var lcd = new five.LCD({
    controller: "JHD1313M1"
  });

  lcd.bgColor("yellow");

  var interval = null;
  var index = 0;

  board.repl.inject({
    preview() {

      if (interval) {
        clearInterval(interval);
        index = 0;
      }

      interval = setInterval(() => {
        if (index === colors.length) {
          clearInterval(interval);
          return;
        }
        var color = colors[index++];
        lcd.bgColor(color).cursor(0, 0).clear().print(color);
      }, 1000);
    }
  });
});
