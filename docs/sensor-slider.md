# Sensor Slider

Run with:
```bash
node eg/sensor-slider.js
```


```javascript
var five = require("johnny-five"),
    board, slider;

board = new five.Board();

board.on("ready", function() {

  // Create a new `slider` hardware instance.
  slider = new five.Sensor("A2");

  // Inject the `slider` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    slider: slider
  });

  //
  // "change", "slide", "touch", "bend"
  //
  // Fires when value of sensor changes
  //
  slider.scale([ 0, 100 ]).on("slide", function() {

    console.log( "slide", this.value );

  });
});

// Tutorials
//
// http://www.dfrobot.com/wiki/index.php?title=Analog_Slide_Position_Sensor_(SKU:_DFR0053)

```


## Breadboard/Illustration


![docs/breadboard/sensor-slider.png](breadboard/sensor-slider.png)
[docs/breadboard/sensor-slider.fzz](breadboard/sensor-slider.fzz)









## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
