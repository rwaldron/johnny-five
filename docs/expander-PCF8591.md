<!--remove-start-->

# Expander - PCF8591

<!--remove-end-->


Using an PCF8591 Expander as a Virtual Board (4 Pin Analog Input)





##### Breadboard for "Expander - PCF8591"



![docs/breadboard/expander-PCF8591.png](breadboard/expander-PCF8591.png)<br>

Fritzing diagram: [docs/breadboard/expander-PCF8591.fzz](breadboard/expander-PCF8591.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/expander-PCF8591.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var virtual = new five.Board.Virtual(
    new five.Expander("PCF8591")
  );

  var a = new five.Sensor({
    pin: "A0",
    board: virtual
  });

  a.on("change", function() {
    console.log(this.value);
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2019 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
