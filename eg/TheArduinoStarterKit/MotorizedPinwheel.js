five = require("johnny-five");
Edison = require("edison-io");
board = new five.Board({io: new Edison()});

board.on("ready", function(){
  gate = new five.Pin(9);
  button = new five.Button(2)
  button.on('press',function(){
    gate.write(1)
  })
  button.on('release', function(){
    gate.write(0)
  })
})
