const moment = require("moment");
const { Board, Led } = require("../lib/johnny-five");
var board = new Board();

board.on("ready", () => {
  const digits = new Led.Digits({
    controller: "HT16K33",
  });
  let toggle = 0;

  setInterval(() => {
    // Toggle the colon part: on for a second, off for a second.
    digits.print(time(toggle ^= 1));
  }, 1000);
});

function time(showColon) {
  var display = "    " + moment().format(
    showColon ? "h:mm" : "h mm"
  );
  return display.slice(-5);
}
/* @markdown

Learn More:

- [JavaScript: A Digital Clock with Johnny-Five](http://bocoup.com/weblog/javascript-arduino-digital-clock-johnny-five/)

@markdown */
