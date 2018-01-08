<!--remove-start-->

# Proximity - SRF10

<!--remove-end-->


Sonar Proximity example with SRF10 sensor.





##### Breadboard for "Proximity - SRF10"



![docs/breadboard/proximity-srf10.png](breadboard/proximity-srf10.png)<br>

Fritzing diagram: [docs/breadboard/proximity-srf10.fzz](breadboard/proximity-srf10.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/proximity-srf10.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var proximity = new five.Proximity({
    controller: "SRF10"
  });

  proximity.on("data", function() {
    console.log("Proximity: ");
    console.log("  cm  : ", this.cm);
    console.log("  in  : ", this.in);
    console.log("-----------------");
  });

  proximity.on("change", function() {
    console.log("The obstruction has moved.");
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
