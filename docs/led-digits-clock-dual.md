<!--remove-start-->

# LED - Digital Clock, Dual Displays

<!--remove-end-->


Demonstrates using dual 7 Segment displays.





##### Breadboard for "LED - Digital Clock, Dual Displays"



![docs/breadboard/led-digits-clock-dual.png](breadboard/led-digits-clock-dual.png)<br>

Fritzing diagram: [docs/breadboard/led-digits-clock-dual.fzz](breadboard/led-digits-clock-dual.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/led-digits-clock-dual.js
```


```javascript
var moment = require("moment");
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var hmm = new five.Led.Digits({
    controller: "HT16K33",
  });
  var seconds = new five.Led.Digits({
    pins: {
      data: 2,
      cs: 3,
      clock: 4,
    }
  });

  var minute = null;
  var toggle = 0;

  setInterval(function() {
    var now = moment();
    var min = now.minute();
    var form;

    if (minute !== min) {
      minute = min;
      form = (toggle ^= 1) ? "h:mm" : "hmm";
      hmm.print((" " + now.format(form)).slice(-5));
    }
    seconds.print("  " + now.format("ss.SSSS"));
  }, 200);
});

```





<iframe width="560" height="315" src="https://www.youtube.com/embed/iD8S--2aJEo" frameborder="0" allowfullscreen></iframe>



## Additional Notes
Learn More:
- [JavaScript: A Digital Clock with Johnny-Five](http://bocoup.com/weblog/javascript-arduino-digital-clock-johnny-five/)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2019 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
