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

    var isForward = this.value > esc.neutral;
    var value = isForward ?
      // Scale 50-100 to 0-100
      five.Fn.scale(this.value, esc.neutral, esc.range[1], 0, 100) :
      // Scale 0-50 to 100-0
      five.Fn.scale(this.value, esc.range[0], esc.neutral, 100, 0);

    if (esc.value !== value) {
      esc[ isForward ? "forward" : "reverse" ](value);
    }
  });
});
