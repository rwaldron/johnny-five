var five = require("../lib/johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the Relay module into the
  // Grove Shield's D6 jack.
  var relay = new five.Relay(6);

  // Manually control the relay
  // from your terminal!
  this.repl.inject({
    replay: relay
  });
});

// @markdown
// For this program, you'll need:
//
// ![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)
// ![Grove - Relay Module](http://www.seeedstudio.com/depot/images/1030200051.jpg)
//
//
// Learn More At:
//
// - [JavaScript: Relay Control with Johnny-Five on Node.js](http://bocoup.com/weblog/javascript-relay-with-johnny-five/)
//
// @markdown

