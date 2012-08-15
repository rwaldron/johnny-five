var five = require("../lib/johnny-five.js"),
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


// @device [Parallax Boe-Bot Gripper](http://www.parallax.com/Portals/0/Downloads/docs/prod/acc/GripperManual-v3.0.pdf)
// @device [DFRobot LG-NS Gripper](http://www.dfrobot.com/index.php?route=product/product&filter_name=gripper&product_id=628#.UCvGymNST_k)
