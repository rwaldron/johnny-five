five = require("johnny-five");
Edison = require("edison-io");
board = new five.Board({io: new Edison()});

board.on("ready", function(){

  leds = five.Leds([2,3,4])

  tmp = new five.Thermometer({
    controller: "TMP36",
    pin: "A0"
  })

  tmp.on("change", function(){
    if(this.celsius >= 22) {
      leds[0].on()
    }else{
      leds[0].off()
    } 
    if(this.celsius >= 24) {
      leds[1].on()
    } else{
      leds[1].off()
    }
    if(this.celsius >= 26) {
      leds[2].on()
    } else{
      leds[2].off()
    }
    console.log(this.celsius + "°C")
  })
})