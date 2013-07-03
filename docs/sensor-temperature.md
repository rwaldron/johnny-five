# Sensor Temperature

Run with:
```bash
node eg/sensor-temperature.js
```


```javascript
var five = require('johnny-five'),
    board, sensor;

board = new five.Board();

board.on('ready', function(){
    sensor = new five.Sensor({
        pin: 'A0',
        freq: 250
    });

    board.repl.inject({
        sensor: sensor
    });

    sensor.on('read', function(){
        var celsius = -(100 * (this.value / 1000) - 50);
        var fahrenheit = celsius * (9/5) + 32;

        console.log(celsius + '°C', fahrenheit + '°F');
    });
});

```

## Breadboard/Illustration




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
