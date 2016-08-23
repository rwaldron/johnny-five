var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({io: new Edison()});

board.on("ready", function() {

  var leds = five.Leds([3,4,5]);
  var btn = five.Button(2);

  btn.on("press", function() {
    leds[0].off();
    leds[1].on().blink(500);
    leds[2].off().blink(500);
  });

  btn.on("release", function() {
    leds[0].on();
    leds[1].off().stop();
    leds[2].off().stop();
  });

});
