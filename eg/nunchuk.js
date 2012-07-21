var five = require("../lib/johnny-five.js"),
    board, nunchuk;

board = new five.Board();

board.on("ready", function() {

  // Create a new `nunchuk` hardware instance.
  nunchuk = new five.Nunchuk({
    device: "RVL-004", 
    freq: 100
  });

  // Nunchuk Event API
  nunchuk.on("read", function( err, timestamp ) {
    console.log(this.joystick);
    console.log(this.accelerometer);
  })

// Further reading
// http://media.pragprog.com/titles/msard/tinker.pdf
// http://lizarum.com/assignments/physical_computing/2008/wii_nunchuck.html
});
