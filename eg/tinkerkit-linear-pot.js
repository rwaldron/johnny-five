var five = require("../lib/johnny-five.js");

new five.Board().on("ready", function() {
  new five.Sensor("I0").scale(0, 255).on("data", function() {
    console.log(Math.round(this.value));
  });
});

// @markdown
// - [TinkerKit Linear Potentiometer](http://tinkerkit.tihhs.nl/linear-pot/)
// - [TinkerKit Shield](http://tinkerkit.tihhs.nl/shield/)
// @markdown
