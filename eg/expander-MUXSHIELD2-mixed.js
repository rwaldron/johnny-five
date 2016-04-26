var Barcli = require("barcli");
var five = require("../lib/johnny-five.js");
var board = new five.Board({
  repl: false,
  debug: false
});

board.on("ready", function() {
  var activeLed = {
    last: -1,
    next: -1,
  };

  var virtual = new five.Board.Virtual(
    new five.Expander("MUXSHIELD2")
  );

  var leds = new five.Leds(
    Array.from({
      length: 16
    }, function(_, index) {
      var bar = new Barcli({
        label: "IO3-" + index,
        range: [0, 1]
      });
      var lit = new five.Sensor({
        type: "digital",
        pin: "IO3-" + index,
        board: virtual,
      });

      var led = new five.Led({
        pin: "IO1-" + index,
        board: virtual,
      });

      lit.on("data", function() {
        if (index === activeLed.last ||
          index === activeLed.next) {
          bar.update(this.value);
        }
      });

      return led;
    })
  );

  var button = new five.Button(9);

  button.on("press", function() {
    activeLed.last = activeLed.next;

    if (activeLed.last !== -1) {
      leds[activeLed.last].off();
    }

    activeLed.next++;

    if (activeLed.next > 15) {
      activeLed.last = 15;
      activeLed.next = 0;
    }

    leds.off();
    leds[activeLed.next].on();
  });
});
