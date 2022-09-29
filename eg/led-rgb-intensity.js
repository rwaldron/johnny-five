const temporal = require("temporal");
const { Board, Led } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  // Initialize the RGB LED
  const led = new Led.RGB([6, 5, 3]);

  // Set to full intensity red
  console.log("100% red");
  led.color("#FF0000");

  temporal.queue([{
    // After 3 seconds, dim to 30% intensity
    wait: 3000,
    task() {
      console.log("30% red");
      led.intensity(30);
    }
  }, {
    // 3 secs then turn blue, still 30% intensity
    wait: 3000,
    task() {
      console.log("30% blue");
      led.color("#0000FF");
    }
  }, {
    // Another 3 seconds, go full intensity blue
    wait: 3000,
    task() {
      console.log("100% blue");
      led.intensity(100);
    }
  }]);
});
