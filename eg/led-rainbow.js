var five = require("../lib/johnny-five.js");

five.Board().on("ready", function() {
  var rgb, rainbow, index;

  rgb = new five.Led.RGB([ 3, 5, 6 ]);
  rainbow = [ "FF000", "FF7F00", "00FF00", "FFFF00", "0000FF", "4B0082", "8F00FF" ];
  index = 0;

  setInterval(function() {
    if ( index + 1 === rainbow.length ) {
      index = 0;
    }
    rgb.color( rainbow[ index++ ] );
  }, 500);
});
