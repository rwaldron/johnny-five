var five = require("../lib/johnny-five.js"),
    board = new five.Board({
      debug: true
    });


board.on("connected", function() {

  exports["board"] = {
    "board": function(test) {

      // TODO: Figure out a way to run tests without a board connected

      test.expect(1);
      test.ok(board, "Board instance");
      test.done();
    }
  };
});
