var color = require("colors");
var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  // Create an I2C `Magnetometer` instance
  var mag = new five.Magnetometer();

  // As the heading changes, log heading value
  mag.on("headingchange", function() {
    console.log(
      (this.bearing.name + " " + Math.floor(this.heading) + "°")[colors[this.bearing.abbr]]
    );
  });
});

var colors = {
  N: "red",
  NbE: "red",
  NNE: "red",
  NEbN: "red",
  NE: "yellow",
  NEbE: "yellow",
  ENE: "yellow",
  EbN: "yellow",
  E: "green",
  EbS: "green",
  ESE: "green",
  SEbE: "green",
  SE: "green",
  SEbS: "cyan",
  SSE: "cyan",
  SbE: "cyan",
  S: "cyan",
  SbW: "cyan",
  SSW: "cyan",
  SWbS: "blue",
  SW: "blue",
  SWbW: "blue",
  WSW: "blue",
  WbS: "blue",
  W: "magenta",
  WbN: "magenta",
  WNW: "magenta",
  NWbW: "magenta",
  NW: "magenta",
  NWbN: "magenta",
  NNW: "magenta",
  NbW: "red"
};
