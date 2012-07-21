var five = require("johnny-five"),
    board, nunchuk;

board = new five.Board();

board.on("ready", function() {

  // Create a new `nunchuk` hardware instance.
  nunchuk = new five.Nunchuk({
    pin: 0x52, // 0x52 == A4
    freq: 100
  });

  // Nunchuk Event API
  nunchuk.on("chuk", function( err, timestamp ) {
    console.log(this.joystick);
    console.log(this.accelerametor);
  })

// Further reading
// http://media.pragprog.com/titles/msard/tinker.pdf
// http://lizarum.com/assignments/physical_computing/2008/wii_nunchuck.html
});
