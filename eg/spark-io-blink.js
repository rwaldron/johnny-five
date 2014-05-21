var five = require("../lib/johnny-five.js");
var Spark = require("spark-io");

var board = new five.Board({
  io: new Spark({
    token: process.env.SPARK_TOKEN,
    deviceId: process.env.SPARK_DEVICE_ID
  })
});

board.on("ready", function() {
  var pin = "A7";
  var led = new five.Led(pin);

  led.strobe(500);

  // this.repl.inject({
  //   led: led
  // });
});
