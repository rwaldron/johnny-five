# Lcd

Run with:
```bash
node eg/lcd.js
```


```javascript
var five = require("johnny-five"),
    lcd;

five.Board().on("ready", function() {


  lcd = new five.LCD({
    cols: 10,
    rows: 2,
    dots: "5x8"
  });


  this.repl.inject({
    lcd: lcd
  });



});

```

## Breadboard




## Documentation

_(Nothing yet)_









## Contributing
All contributions must adhere to the the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
