var five = require("../lib/johnny-five.js");

new five.Board().on("ready", function() {
  new five.Sensor("I0").scale(0, 100).on("read", function() {
    console.log( Math.round(this.value) );
  });
});

// @device http://www.tinkerkit.com/linear-pot/
// @device http://www.tinkerkit.com/shield/
