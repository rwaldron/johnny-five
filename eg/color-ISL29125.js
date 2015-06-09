var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var rgb = new five.Led.RGB([ 9, 10, 11 ]);
  var color = new five.Color({
    controller: "ISL29125"
  });

  color.on("change", function() {
    console.log("Color: ", five.Color.hexCode(this.rgb));
  });
});


// TODO: need Fritzing for this
