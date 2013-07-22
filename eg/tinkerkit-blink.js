var five = require("../lib/johnny-five.js");

new five.Board().on("ready", function() {
  new five.Led("O0").strobe(250);
});

// @markdown
// - [TinkerKit Led](http://www.tinkerkit.com/led-red-10mm/)
// - [TinkerKit Shield](http://www.tinkerkit.com/shield/)
// @markdown
