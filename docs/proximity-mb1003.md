<!--remove-start-->

# Proximity - MB1003


Basic sonar Proximity example with MB1003 sensor.


Run with:
```bash
node eg/proximity-mb1003.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five"),
  prox, led;

five.Board().on("ready", function() {

  var proximity = new five.Proximity({
    controller: "MB1003",
    pin: "A0"
  });

  proximity.on("data", function(data) {
    console.log(data.cm + "cm", data.in + "in");
  });

  proximity.on("change", function(data) {
    console.log("The obstruction has moved.");
  });

});

```


## Illustrations / Photos


### Breadboard for "Proximity - MB1003"



![docs/breadboard/proximity-mb1003.png](breadboard/proximity-mb1003.png)<br>

Fritzing diagram: [docs/breadboard/proximity-mb1003.fzz](breadboard/proximity-mb1003.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
