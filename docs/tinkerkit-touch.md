# Tinkerkit Touch

Run with:
```bash
node eg/tinkerkit-touch.js
```


```javascript
var five = require("johnny-five");

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


```

## Breadboard/Illustration

![docs/breadboard/tinkerkit-touch.png](breadboard/tinkerkit-touch.png)



## Devices

- http://www.tinkerkit.com/touch/
- http://www.tinkerkit.com/shield/


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
