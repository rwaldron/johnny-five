var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var virtual = new five.Board.Virtual(
    new five.Expander("GROVEPI")
  );

  var prox = new five.Proximity({
    board: virtual,
    controller: "ULTRASONIC_PING",
    pin: "D7"
  });

  prox.on("change", function() {
    console.log(`${this.cm}cm`);
  });

  var led = new five.Led({
    board: virtual,
    pin: "D3"
  });

  led.on();

  var a0 = new five.Sensor({
    pin: "A0",
    board: virtual
  });

  a0.on("change", function() {
    console.log(`a0: ${this.value}`);
    led.brightness(this.value >> 2);
  });

  var a2 = new five.Sensor({
    pin: "A2",
    board: virtual
  });

  a2.on("change", function() {
    console.log(`a2: ${this.value}`);
  });

  var d6 = new five.Button({
    pin: "D6",
    board: virtual
  });

  d6.on("press", function() {
    console.log(`d6: press`);
  });

  d6.on("release", function() {
    console.log(`d6: release`);
  });

  var d2 = new five.Button({
    pin: "D2",
    board: virtual
  });

  d2.on("press", function() {
    console.log(`d2: press`);
  });

  d2.on("release", function() {
    console.log(`d2: release`);
  });
});
