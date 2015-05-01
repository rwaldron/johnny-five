<!--remove-start-->

# Proximity - MB1230



Run with:
```bash
node eg/proximity-mb1230.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");

five.Board().on("ready", function() {

  var proximity = new five.Proximity({
    controller: "MB1230",
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


### Proximity - MB1230


Basic sonar Proximity example with MB1230 sensor.


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
