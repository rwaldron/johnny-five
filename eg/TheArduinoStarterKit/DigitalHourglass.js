five = require("johnny-five");
Edison = require("edison-io");
board = new five.Board({io: new Edison()});

board.on("ready", function(){
  leds = new five.Leds([2,3,4,5,6,7]);
  tilt = new five.Sensor({pin:8,type:'digital'});
  i = 0;
  this.loop(1000*60*10,function(){
    leds[i].on()
    i = (i + 1) % 6;
  })
  tilt.on('change',function(){
    i=0;
    leds.off()
  })
})
