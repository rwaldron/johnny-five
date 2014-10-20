var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var vkey = new five.Keypad("A0");

  // TODO: digital 10 pin keypad
  // var dkey = new five.Keypad({
  //   // Digital Pins must be mapped to
  //   // appropriate keypad number.
  //   //    pin => num/char
  //   pins: {
  //     // ?
  //   }
  // });

  var ikey = new five.Keypad({
    controller: "MPR121",
    address: 0x5A
  });

  var pads = {
    vkey: vkey,
    ikey: ikey,
  };

  Object.keys(pads).forEach(function(key) {
    ["change", "press", "hold", "release"].forEach(function(event) {
      pads[key].on(event, function(data) {
        console.log("Pad: %s, Event: %s, Which: %s", key, event, data);
      });
    });
  });
});
