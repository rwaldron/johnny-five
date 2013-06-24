# Tinkerkit Blink

Run with:
```bash
node eg/tinkerkit-blink.js
```


```javascript
var five = require("johnny-five");

new five.Board().on("ready", function() {
  new five.Led("O0").strobe(250);
});


```

## Breadboard/Illustration

![docs/breadboard/tinkerkit-blink.png](breadboard/tinkerkit-blink.png)



## Devices

- http://www.tinkerkit.com/led-red-10mm/
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
