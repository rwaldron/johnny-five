var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({io: new Edison()});

board.on("ready", function() {
  var sensor = new five.Sensor({pin:"A0",freq: 30});
  var piezo = new five.Piezo(8);
  var min = 1024;
  var max = 0;

  sensor.on("data",function() {
    min = Math.min(min,this.value);
    max = Math.max(max,this.value);
    var pitch = five.Fn.scale(this.value, min, max, 50, 4000);
    piezo.frequency(pitch, 20);
    console.log(min,max,pitch);
  });
});
