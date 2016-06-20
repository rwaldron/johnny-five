five = require("johnny-five");
Edison = require("edison-io");
board = new five.Board({io: new Edison()});

board.on("ready", function(){

  led = new five.Led.RGB([6,5,3]);
  b = new Buffer(3);
  sensors = new five.Sensors([{pin:'A0'},{pin:'A1'},{pin:'A2'}]);
  sensors.on('change',function(){
    b[0] = sensors[0].analog;
    b[1] = sensors[1].analog;
    b[2] = sensors[2].analog;
    c = b.toString('hex');
    console.log(c);
    led.color("#" + c);
  })
})
