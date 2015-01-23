<!--remove-start-->
# Nodeconf Compass

Run with:
```bash
node eg/nodeconf-compass.js
```
<!--remove-end-->

```javascript
var color = require("colors");
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Create an I2C `Magnetometer` instance
  var mag = new five.Magnetometer();

  // As the heading changes, log heading value
  mag.on("headingchange", function() {
    console.log(
      (this.bearing.name + " " + Math.floor(this.heading) + "°")[colors[this.bearing.abbr]]
    );
  });
});

var colors = {
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








<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
