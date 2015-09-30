var moment = require("moment");
var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var hmm = new five.Led.Digits({
    controller: "HT16K33",
  });
  var seconds = new five.Led.Digits({
    pins: {
      data: 2,
      cs: 3,
      clock: 4,
    }
  });

  var minute = null;
  var toggle = 0;

  setInterval(function() {
    var now = moment();
    var min = now.minute();
    var form;

    if (minute !== min) {
      minute = min;
      form = (toggle ^= 1) ? "h:mm" : "hmm";
      hmm.print((" " + now.format(form)).slice(-5));
    }
    seconds.print("  " + now.format("ss.SSSS"));
  }, 200);
});
// @markdown
//
// Learn More:
//
// - [JavaScript: A Digital Clock with Johnny-Five](http://bocoup.com/weblog/javascript-arduino-digital-clock-johnny-five/)
//
// @markdown
