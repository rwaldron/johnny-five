var five = require("../lib/johnny-five.js");

new five.Board().on("ready", function() {
  // Attaching to an O* pin in a deviation from
  // TinkerKit tutorials which instruct to attach
  // the touch to an I* pin.
  //
  // For the "touch" module, simply use a Button
  // instance, like this:
  var touch = new five.Button("O5");

  [ "down", "up", "hold" ].forEach(function( type ) {
    touch.on( type, function() {
      console.log( type );
    });
  });
});

// @device http://www.tinkerkit.com/touch/
// @device http://www.tinkerkit.com/shield/
