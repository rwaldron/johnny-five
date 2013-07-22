var five = require("../lib/johnny-five.js");

new five.Board().on("ready", function() {
  // Attaching to an O* pin in a deviation from
  // TinkerKit tutorials which instruct to attach
  // the button to an I* pin.
  var button = new five.Button("O5");

  [ "down", "up", "hold" ].forEach(function( type ) {
    button.on( type, function() {
      console.log( type );
    });
  });
});

// @markdown
// - [TinkerKit Button](http://www.tinkerkit.com/button/)
// - [TinkerKit Shield](http://www.tinkerkit.com/shield/)
// @markdown
