var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({io: new Edison()});

board.on("ready", function() {
  var led = new five.Led.RGB([6,5,3]);
  var sensors = new five.Sensors([{pin:"A0"},{pin:"A1"},{pin:"A2"}]);
  sensors.on("change",function() {
    var c = sensors.reduce(function(s, sensor) {
      return s + sensor.analog.toString(16);
    }, "#");
    console.log(c);
    led.color(c);
  });
});
