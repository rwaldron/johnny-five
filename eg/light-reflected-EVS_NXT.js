var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var reflect = new five.Light({
    controller: "EVS_NXT",
    pin: "BBS1",
    mode: "reflected"
  });

  reflect.on("change", function() {
    console.log("Light Reflection Level: ", this.level);
  });
});
