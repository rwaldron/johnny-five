var exec = require("child_process").exec;
var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var lcd = new five.LCD({
    controller: "JHD1313M1"
  });

  var color = new five.Color({
    controller: "EVS_EV3",
    pin: "BAS1"
  });

  color.on("change", function() {
    lcd.bgColor(this.rgb);
    // console.log("Color: ", this.rgb);
  });
});
