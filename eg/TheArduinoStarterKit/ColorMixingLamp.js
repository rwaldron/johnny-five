var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({io: new Edison()});

board.on("ready", function() {

  var led = new five.Led.RGB([6,5,3]);
  var b = new Buffer(3);
  var sensors = new five.Sensors([{pin:"A0"},{pin:"A1"},{pin:"A2"}]);
  sensors.on("change",function() {
    b[0] = sensors[0].analog;
    b[1] = sensors[1].analog;
    b[2] = sensors[2].analog;
    var c = b.toString("hex");
    console.log(c);
    led.color("#" + c);
  });
});
