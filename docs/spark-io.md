<!--remove-start-->

# spark-io - Spark Core


Example using Johnny-Five + Spark-io to control a Spark Core device wirelessly.



More info: [https://github.com/rwaldron/spark-io/](https://github.com/rwaldron/spark-io/)


Run with:
```bash
node eg/spark-io.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");
var Spark = require("spark-io");
var board;

// Create Johnny-Five board connected via Spark.
// Assumes access tokens are stored as environment variables
// but you can enter them directly below instead.
board = new five.Board({
  io: new Spark({
    token: process.env.SPARK_TOKEN,
    deviceId: process.env.SPARK_DEVICE_ID
  })
});

board.on("ready", function() {
  console.log("CONNECTED");

  // Once connected, we can do normal Johnny-Five stuff
  var led = new five.Led("D1");
  led.blink();

});

```


## Illustrations / Photos


### Spark Core Wifi Device



![docs/images/spark-core.jpg](images/spark-core.jpg)  

### LED on pin D1 (Spark Core)



![docs/breadboard/spark-led.png](breadboard/spark-led.png)<br>
Fritzing diagram: [docs/breadboard/spark-led.fzz](breadboard/spark-led.fzz)

&nbsp;




## Additional Notes


In order to use the spark-io library, you will need to load the special
[voodoospark](https://github.com/voodootikigod/voodoospark) firmware onto your
device. We recommend you review [VoodooSpark's Getting Started](https://github.com/voodootikigod/voodoospark#getting-started) before continuing.

We also recommend storing your Spark token and device ID in a dot file so they can be accessed as properties of `process.env`. Create a file in your home directory called `.sparkrc` that contains:

```sh
export SPARK_TOKEN="your spark token"
export SPARK_DEVICE_ID="your device id"
```

Then add the following to your dot-rc file of choice:

```sh
source ~/.sparkrc
```

Ensure your host computer (where you're running your Node application) and the Spark are on the same local network.




&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
