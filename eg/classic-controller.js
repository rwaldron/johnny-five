var five = require("../lib/johnny-five.js"),
  board, nunchuk;

board = new five.Board();


// Setup for bread board
// Wire Color   =>  Meaning   =>  Arduino Pin Down
// Yellow       =>  SCK       =>  A04
// White        =>  GND       =>  Ground
// Red          =>  5v        =>  5v
// Green        =>  SDA       =>  A05


board.on("ready", function() {

  // Create a new `Wii.Classic` hardware instance,
  // specifically the RVL-005 device (classic controller).
  var classicController = five.Wii.Classic({
    freq: 100
  });


  // Nunchuk Event API
  //

  // "read" (nunchuk)
  //
  // Fired when the joystick detects a change in
  // axis position.
  //
  // nunchuk.on( "read", function( err ) {

  // });

  // "change", "axischange" (joystick)
  //
  // Fired when the joystick detects a change in
  // axis position.
  //
  nunchuk.joystick.left.on("change", function(err, event) {
    console.log(
      "Left joystick " + event.axis,
      event.target[event.axis],
      event.axis, event.direction
    );
  });

  nunchuk.joystick.right.on("change", function(err, event) {
    console.log(
      "Right joystick " + event.axis,
      event.target[event.axis],
      event.axis, event.direction
    );
  });

  // "down"
  // aliases: "press", "tap", "impact", "hit"
  //
  // Fired when any nunchuk button is "down"
  //

  // "up"
  // alias: "release"
  //
  // Fired when any nunchuk button is "up"
  //

  // "hold"
  //
  // Fired when any nunchuk button is in the "down" state for
  // a specified amount of time. Defaults to 500ms
  //
  // To specify a custom hold time, use the "holdtime"
  // option of the Nunchuk constructor.
  //


  ["down", "up", "hold"].forEach(function(type) {

    nunchuk.on(type, function(err, event) {
      console.log(
        event.target.which + " is " + type,

        {
          isUp: event.target.isUp,
          isDown: event.target.isDown
        }
      );
    });

  });


  // Further reading
  // http://media.pragprog.com/titles/msard/tinker.pdf
  // http://lizarum.com/assignments/physical_computing/2008/wii_nunchuck.html
});
