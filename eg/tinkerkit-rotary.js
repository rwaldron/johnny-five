var five = require("../lib/johnny-five.js");

new five.Board().on("ready", function() {
  var servo = new five.Servo("O0");

  new five.Sensor("I1").scale(0, 180).on("change", function() {
    servo.to(this.value);
  });
});

// @markdown
// - [TinkerKit Servo](http://www.tinkerkit.com/servo/)
// - [TinkerKit Linear Potentiometer](http://www.tinkerkit.com/linear-pot/)
// - [TinkerKit Shield](http://www.tinkerkit.com/shield/)
// @markdown
