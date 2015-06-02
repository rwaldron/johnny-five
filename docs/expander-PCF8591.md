<!--remove-start-->

# Expander - PCF8591


Using an PCF8591 Expander as a Virtual Board (4 Pin Analog Input)


Run with:
```bash
node eg/expander-PCF8591.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var virtual = new five.Board.Virtual(
    new five.Expander({
      controller: "PCF8591",
      // vref:
    })
  );

  var a = new five.Sensor({
    pin: "A3",
    board: virtual
  });

  a.on("change", function() {
    console.log(this.value);
  });
});

```


## Illustrations / Photos


### Breadboard for "Expander - PCF8591"



![docs/breadboard/expander-PCF8591.png](breadboard/expander-PCF8591.png)<br>

Fritzing diagram: [docs/breadboard/expander-PCF8591.fzz](breadboard/expander-PCF8591.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
