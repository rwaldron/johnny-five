var five = require("../lib/johnny-five.js");

five.Board().on("ready", function() {
  // Create a new `IR.Reflect` hardware instance.
  //
  // five.IR.Reflect();
  //
  // (Alias of:
  //   new five.IR({
  //    device: "QRE1113GR",
  //    freq: 50
  //   });
  // )
  //

  var ir = new five.IR.Reflect();

  // "data"
  //
  // Fires continuously, every 66ms.
  //
  ir.on("data", function() {
    console.log("data");
  });
});
