<!--remove-start-->

# LED - Blink

<!--remove-end-->


Basic LED blink example.





##### LED on pin 13 (Arduino UNO)


LED inserted directly into pin 13


![docs/breadboard/led-13.png](breadboard/led-13.png)<br>

Fritzing diagram: [docs/breadboard/led-13.fzz](breadboard/led-13.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/led-blink.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  var led = new five.Led(13);

  // "blink" the led in 500ms on-off phase periods
  led.blink(500);
});

```


## Illustrations / Photos


### LED on pin 13 (Arduino UNO)


LED inserted directly into pin 13


![docs/images/led.jpg](images/led.jpg)  

##### LED on pin 13 with breadboard and resistor (Arduino UNO)


LED on a breadboard and demonstrating use of a resistor


![docs/breadboard/led-resistor.png](breadboard/led-resistor.png)<br>

Fritzing diagram: [docs/breadboard/led-resistor.fzz](breadboard/led-resistor.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2017 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
