const {Board, Sensor} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", function() {

  const flex = new Sensor({
    pin: "A2"
  });

  // Inject the `flex` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({ flex });

  flex.on("change", value => {
    console.log("Flex: ");
    console.log("  value  : ", flex.value);
    console.log("-----------------");
  });
});
