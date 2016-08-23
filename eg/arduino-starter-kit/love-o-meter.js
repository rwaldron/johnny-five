var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  var leds = five.Leds([2, 3, 4]);

  var tmp = new five.Thermometer({
    controller: "TMP36",
    pin: "A0"
  });

  tmp.on("change", function() {
    if (this.celsius >= 22) {
      leds[0].on();
    } else {
      leds[0].off();
    }
    if (this.celsius >= 24) {
      leds[1].on();
    } else {
      leds[1].off();
    }
    if (this.celsius >= 26) {
      leds[2].on();
    } else {
      leds[2].off();
    }
    console.log(this.celsius + "°C");
  });
});
