# Whisker

Run with:
```bash
node eg/whisker.js
```


```javascript
var Change, five;

Change = require("../eg/change.js");
five = require("johnny-five");

new five.Boards([ "control", "nodebot" ]).on("ready", function(boards) {
  var controllers, changes, nodebot, whiskers, opposing, directions, speed;

  controllers = {
    x: new five.Sensor({
      board: boards.controller,
      pin: "I0"
    }),
    y: new five.Sensor({
      board: boards.controller,
      pin: "I1"
    }),
    speed: new five.Sensor({
      board: boards.controller,
      pin: "I2"
    })
  };

  nodebot = new five.Nodebot({
    board: boards.nodebot,
    right: 10,
    left: 11
  });

  whiskers = {
    left: new five.Pin({
      board: boards.nodebot,
      addr: 5,
    }),
    right: new five.Pin({
      board: boards.nodebot,
      addr: 7
    }),
  };

  changes = {
    x: new Change(),
    y: new Change(),
    speed: new Change()
  };

  opposing = {
    left: "right",
    right: "left"
  };

  directions = {
    x: {
      1: "left",
      3: "right"
    },
    y: {
      1: "rev",
      3: "fwd"
    }
  };

  [ "left", "right" ].forEach(function( impact ) {
    whiskers[ impact ].on("high", function() {
      var turn = opposing[ impact ];

      console.log(
        "%s impact, turning %s",
        impact.toUpperCase(),
        turn.toUpperCase()
      );

      nodebot.stop()[ turn ]( 500 );
    });
  });



  [ "x", "y" ].forEach(function( axis ) {
    controllers[ axis ].scale(1, 3).on("change", function() {
      var round = Math.round( this.value );

      if ( changes[ axis ].isNoticeable( round ) ) {
        if ( round === 2 ) {
          nodebot.stop();
        } else {
          // console.log( axis, round, directions[ axis ][ round ] );
          nodebot[ directions[ axis ][ round ] ]();
        }
      } else {
        changes[ axis ].last = round;
      }
    });
  });

  controllers.speed.scale(0, 6).on("change", function() {
    var value = Math.round( this.value );

    if ( changes.speed.isNoticeable( value ) ) {
      // console.log( "update nodebot.speed: %d", value );
      // console.log( nodebot.motion );
      nodebot.speed = value;

      if ( nodebot.motion !== "stop" ) {
        nodebot[ nodebot.motion ]();
      }
    }
  });

  boards.control.repl.inject({
    n: nodebot
  });

});

```













## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
