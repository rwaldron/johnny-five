var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {
  var sensor = new five.Sensor({
    pin: "A0",
    freq: 100,
    threshold: 8
  });
  var piezo = new five.Piezo(8);
  sensor.on("change", function() {
    console.log(this.value);
    if (five.Fn.inRange(this.value, 1020, 1023)) {
      piezo.frequency(five.Piezo.Notes["c4"], 50);
    } else if (five.Fn.inRange(this.value, 990, 1010)) {
      piezo.frequency(five.Piezo.Notes["d4"], 50);
    } else if (five.Fn.inRange(this.value, 500, 520)) {
      piezo.frequency(five.Piezo.Notes["e4"], 50);
    } else if (five.Fn.inRange(this.value, 20, 40)) {
      piezo.frequency(five.Piezo.Notes["f4"], 50);
    } else {
      piezo.noTone();
    }
  });
});
