var five = require("../lib/johnny-five.js"),
  board, nunchuk;

board = new five.Board();

board.on("ready", function() {

  // When using the WiiChuck adapter with an UNO,
  // these pins act as the Ground and Power lines.
  // This will not work on a Leonardo, so these
  // lines can be removed.
  new five.Pin("A2").low();
  new five.Pin("A3").high();

  // Create a new `nunchuk` hardware instance.
  nunchuk = new five.Wii.Nunchuk({
    freq: 50
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
  nunchuk.joystick.on("change", function(err, event) {
    console.log(
      "joystick " + event.axis,
      event.target[event.axis],
      event.axis, event.direction
    );
  });

  // "change", "axischange" (accelerometer)
  //
  // Fired when the accelerometer detects a change in
  // axis position.
  //
  nunchuk.accelerometer.on("change", function(err, event) {
    console.log(
      "accelerometer " + event.axis,
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
