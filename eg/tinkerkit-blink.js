var five = require("../lib/johnny-five.js");

new five.Board().on("ready", function() {
  new five.Led("O0").strobe(250);
});
