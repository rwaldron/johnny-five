five = require("johnny-five");
Edison = require("edison-io");
board = new five.Board({io: new Edison()});

board.on("ready", function(){
  sensor = new five.Sensor({pin:'A0',freq: 30})
  piezo = new five.Piezo(8);
  min = 1024
  max = 0

  sensor.on('data',function(){
    min = Math.min(min,this.value)
    max = Math.max(max,this.value)
    pitch = five.Fn.scale(this.value, min, max, 50, 4000)
    piezo.frequency(pitch, 20)
    console.log(min,max,pitch)
  })
})
