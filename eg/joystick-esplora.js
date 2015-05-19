var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  /*
    Be sure to reflash your Esplora with StandardFirmata!

    In the Arduino IDE:

    Tools > Boards > Arduino Leonard or Arduino Esplora
   */
  var joystick = new five.Joystick({
    controller: "ESPLORA"
  });

  joystick.on("change", function() {
    console.log("Joystick");
    console.log("  x : ", this.x);
    console.log("  y : ", this.y);
    console.log("--------------------------------------");
  });
});
