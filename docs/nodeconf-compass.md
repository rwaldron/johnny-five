# Nodeconf Compass

Run with:
```bash
node eg/nodeconf-compass.js
```


```javascript
var color = require("colors"),
  five = require("johnny-five"),
  colors, mag;

five.Board().on("ready", function() {

  // Create an I2C `Magnetometer` instance
  mag = new five.Magnetometer();

  // As the heading changes, log heading value
  mag.on("headingchange", function() {
    var log;

    log = (this.bearing.name + " " + Math.floor(this.heading) + "°");

    console.log(
      log[colors[this.bearing.abbr]]
    );
  });
});

colors = {
  N: "red",
  NbE: "red",
  NNE: "red",
  NEbN: "red",
  NE: "yellow",
  NEbE: "yellow",
  ENE: "yellow",
  EbN: "yellow",
  E: "green",
  EbS: "green",
  ESE: "green",
  SEbE: "green",
  SE: "green",
  SEbS: "cyan",
  SSE: "cyan",
  SbE: "cyan",
  S: "cyan",
  SbW: "cyan",
  SSW: "cyan",
  SWbS: "blue",
  SW: "blue",
  SWbW: "blue",
  WSW: "blue",
  WbS: "blue",
  W: "magenta",
  WbN: "magenta",
  WNW: "magenta",
  NWbW: "magenta",
  NW: "magenta",
  NWbN: "magenta",
  NNW: "magenta",
  NbW: "red"
};

```









## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
