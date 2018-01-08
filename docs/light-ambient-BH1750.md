<!--remove-start-->

# Light - BH1750

<!--remove-end-->






##### BH1750 (Arduino)



![docs/breadboard/light-ambient-BH1750-arduino.png](breadboard/light-ambient-BH1750-arduino.png)<br>

Fritzing diagram: [docs/breadboard/light-ambient-BH1750-arduino.fzz](breadboard/light-ambient-BH1750-arduino.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/light-ambient-BH1750.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var light = new five.Light({
    controller: "BH1750",
  });

  light.on("data", function() {
    console.log("Lux: ", this.lux);
  });
});

```


## Illustrations / Photos


##### BH1750 (Tessel 2)



![docs/breadboard/light-ambient-BH1750-tessel.png](breadboard/light-ambient-BH1750-tessel.png)<br>

Fritzing diagram: [docs/breadboard/light-ambient-BH1750-tessel.fzz](breadboard/light-ambient-BH1750-tessel.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
