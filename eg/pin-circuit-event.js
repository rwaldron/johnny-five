var five = require("../lib/johnny-five.js");

new five.Board().on("ready", function() {
  var pin = new five.Pin(5);

  // Event tests
  [ "high", "low" ].forEach(function( type ) {
    pin.on( type, function() {
      console.log( "Circuit Event: ", type );
    });
  });
});
