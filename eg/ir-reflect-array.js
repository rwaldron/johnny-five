var five = require("../lib/johnny-five");

five.Board().on("ready", function() {
  var calibrating = true;
  var eyes = new five.IR.Reflect.Collection({
    emitter: 13,
    pins: ["A0", "A1", "A2", "A3", "A4", "A5"]
  });

  // calibrate for two seconds
  eyes.calibrateUntil(function() {
    return !calibrating;
  });
  setTimeout(function() {
    calibrating = false;
  }, 2000);

  eyes.enable();

  // "line"
  //
  // Fires continuously once calibrated
  //
  eyes.on("line", function(line) {
    console.log("line: ", line);
  });
});
