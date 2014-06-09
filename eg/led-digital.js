//
// Demonstrates using some of the LED digital commands together
//

var five = require("../lib/johnny-five.js");

five.Board().on("ready", function() {

  // Defaults to pin 13
  var led = new five.Led(process.argv[2] || 13);

  // Turn on the LED
  console.log("led.on()");
  led.on();

  // Wait 3 seconds, then start strobing the LED
  this.wait(3000, function() {
    console.log("led.strobe(100)");
    led.strobe(100);
  });

  // Stop the strobing and turn the LED off.
  // Note, this is 10 seconds from programm execution,
  // not 10 seconds from when strobe starts.
  // You would need to nest the waits or use something
  // like `temporal` to be more precise in sequencing.
  this.wait(10000, function() {
    led.stop(); // required or it will keep strobing

    console.log("led.off()");
    led.off();
  });


});
