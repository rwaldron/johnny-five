var five = require("../lib/johnny-five.js"),
    Change = require("../eg/change.js");

new five.Board().on("ready", function() {
  // var servo = new five.Servo("O0");

  var joystick = {
    x: new five.Sensor({
      pin: "I0"
    }),
    y: new five.Sensor({
      pin: "I1"
    })
  };

  var changes = {
    x: new Change(),
    y: new Change()
  };

  var dirs = {
    x: {
      1: "left",
      3: "right"
    },
    y: {
      1: "down",
      3: "up"
    }
  };


  [ "x", "y" ].forEach(function( axis ) {
    joystick[ axis ].scale(1, 3).on("change", function() {
      var round = Math.round( this.value );

      if ( round !== 2 && changes[ axis ].isNoticeable( round ) ) {
        console.log(
          "%s changed noticeably (%d): %s", axis,  round, dirs[ axis ][ round ]
        );
      } else {
        changes[ axis ].last = round;
      }
    });
  });
});


// @device http://www.tinkerkit.com/joystick/
// @device http://www.tinkerkit.com/shield/
