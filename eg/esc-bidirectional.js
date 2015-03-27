var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var start = Date.now();
  var esc = new five.ESC({
    device: "FORWARD_REVERSE",
    neutral: 50,
    pin: 11
  });
  var throttle = new five.Sensor("A0");
  var brake = new five.Button(4);

  brake.on("press", function() {
    esc.brake();
  });

  throttle.scale(0, 100).on("change", function() {
    // 2 Seconds for arming.
    if (Date.now() - start < 2e3) {
      return;
    }

    if (esc.value !== this.value) {
      esc.speed(this.value);
    }
  });
});
