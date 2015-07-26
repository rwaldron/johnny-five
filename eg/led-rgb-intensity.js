var temporal = require("temporal");
var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  // Initialize the RGB LED
  var led = new five.Led.RGB([6, 5, 3]);

  // Set to full intensity red
  console.log("100% red");
  led.color("#FF0000");

  temporal.queue([
    {
      // After 3 seconds, dim to 30% intensity
      wait: 3000,
      task: function() {
        console.log("30% red");
        led.intensity(30);
      }
    },
    {
      // 3 secs then turn blue, still 30% intensity
      wait: 3000,
      task: function() {
        console.log("30% blue");
        led.color("#0000FF");
      }
    },
    {
      // Another 3 seconds, go full intensity blue
      wait: 3000,
      task: function() {
        console.log("100% blue");
        led.intensity(100);
      }
    },
  ]);
});
