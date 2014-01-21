var five = require("../lib/johnny-five.js");
var Spark = require("spark-io");

var board = new five.Board({
  io: new Spark({
    token: "a81cf99a8c1fe45b74d749d521a32671eb443d5e",
    deviceId: "53ff6f065067544840551187"
  })
});

board.on("ready", function() {
  var led = new five.Led("D7");

  led.strobe(1000);

  this.repl.inject({
    led: led
  });
});
