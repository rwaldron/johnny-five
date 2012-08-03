var five = require("../lib/johnny-five.js"),
    board, nunchuk;

board = new five.Board();

board.on("ready", function() {

  // Create a new `nunchuk` hardware instance.
  nunchuk = new five.Nunchuk({
    device: "RVL-004",
    freq: 100,
    threshold : 100
  });

  nunchuk.on( "read", function( err, e ){ 
    // console.log(e.type);
  } );
  
  // Nunchuk Event API
  nunchuk.joystick.on( "change", function( e ) {
    console.log( "joystick " + e.axis , e.target[ e.axis ], e.axis, e.direction );
  });

  nunchuk.accelerometer.on( "change", function( e ) {
    console.log( "accelerometer " + e.axis , e.target[ e.axis ], e.axis, e.direction );
  });

  nunchuk.on( "down", function( e ) {
    console.log( "down", e.target.which, e.target.isUp, e.target.isDown );
  });
  nunchuk.on( "up", function( e ) {
    console.log( "up", e.target.which, e.target.isUp, e.target.isDown );
  });
  nunchuk.on( "hold", function( e ) {
    console.log( "hold", e.target.which, e.target.isUp, e.target.isDown );
  });

// Further reading
// http://media.pragprog.com/titles/msard/tinker.pdf
// http://lizarum.com/assignments/physical_computing/2008/wii_nunchuck.html
});
