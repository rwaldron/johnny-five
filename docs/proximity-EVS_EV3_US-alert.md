<!--remove-start-->

# Proximity - EVShield EV3 (Ultrasonic)

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/proximity-EVS_EV3_US-alert.js
```


```javascript
const { Board, Led, Leds, Proximity } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const proximity = new Proximity({
    controller: "EVS_EV3_US",
    pin: "BAS1"
  });
  const red = new Led(10);
  const green = new Led(11);
  const leds = new Leds([red, green]);

  green.on();

  proximity.on("change", () => {
    if (proximity.cm < 25) {
      if (!red.isOn) {
        leds.toggle();
      }
    } else if (!green.isOn) {
      leds.toggle();
    }
  });
});

```





<iframe width="560" height="315" src="https://www.youtube.com/embed/6-tM7L28Gcg" frameborder="0" allowfullscreen></iframe>



&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
