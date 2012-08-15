# Gripper

Run with:
```bash
node eg/gripper.js
```


```javascript
var five = require("johnny-five"),
    gripper;

(new five.Board()).on("ready", function() {

  // Create a new `gripper` hardware instance.
  // This example allows the gripper module to
  // create a completely default instance
  gripper = new five.Gripper(9);

  // Inject the `gripper` hardware into
  // the Repl instance's context;
  // allows direct command line access
  this.repl.inject({
    g: gripper
  });


  // gripper.open()
  //
  // gripper.close()
  //
  // gripper.set([0-10])
  //
  //
  // g.*() from REPL


});



```

## Breadboard

<img src="https://raw.github.com/rwldrn/johnny-five/master/docs/breadboard/gripper.png">

[gripper.fzz](https://github.com/rwldrn/johnny-five/blob/master/docs/breadboard/gripper.fzz)



## Devices

- [Parallax Boe-Bot Gripper](http://www.parallax.com/Portals/0/Downloads/docs/prod/acc/GripperManual-v3.0.pdf)
- [DFRobot LG-NS Gripper](http://www.dfrobot.com/index.php?route=product/product&filter_name=gripper&product_id=628#.UCvGymNST_k)


## Documentation

_(Nothing yet)_









## Contributing
All contributions must adhere to the the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
