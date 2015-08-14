var five = require("../");
var Tessel = require("tessel-io");
var board = new five.Board({
  io: new Tessel()
});

board.on("ready", function() {
  var temp = new five.Temperature({
    controller: "SI7020",
    port: "A"
  });

  temp.on("change", function() {
    console.log(this.celsius);
  });
});
