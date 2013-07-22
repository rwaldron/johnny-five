# Motobot

Run with:
```bash
node eg/motobot.js
```


```javascript
var five = require("johnny-five"),
    keypress = require("keypress"),
    board = new five.Board();


board.on("ready", function() {
  var speed, command, motors;

  speed = 100;
  commands = null;
  motors = {
    a: new five.Motor([ 3, 12 ]),
    b: new five.Motor([ 11, 13 ])
  };

  this.repl.inject({
    motors: motors
  });

  function controller( ch, key ) {
    if ( key ) {
      if ( key.name === "space" ) {
        motors.a.stop();
        motors.b.stop();
      }
      if ( key.name === "up" ) {
        motors.a.fwd(speed);
        motors.b.fwd(speed);
      }
      if ( key.name == "down" ) {
        motors.a.rev(speed);
        motors.b.rev(speed);
      }
      if ( key.name == "right" ) {
        motors.a.rev(speed);
        motors.b.fwd(speed);
      }
      if ( key.name == "left" ) {
        motors.a.fwd(speed);
        motors.b.rev(speed);
      }

      commands = [].slice.call(arguments);
    } else {
      if ( ch >= 1 && ch <= 9 ) {
        speed = five.Fn.scale( ch, 1, 9, 0, 255 );
        controller.apply(null, commands);
      }
    }
  }


  keypress(process.stdin);

  process.stdin.on("keypress", controller);
  process.stdin.setRawMode(true);
  process.stdin.resume();
});

```

## Breadboard/Illustration

![docs/breadboard/motobot.png](breadboard/motobot.png)



## Devices




## Documentation

_(Nothing yet)_









## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
