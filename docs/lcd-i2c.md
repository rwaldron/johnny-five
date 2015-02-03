<!--remove-start-->
# LCD, I2C

Run with:
```bash
node eg/lcd-i2c.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  var lcd = new five.LCD({
    controller: "JHD1313M1"
  });

  lcd.useChar("heart");

  lcd.cursor(0, 0).print("hello :heart:");

  lcd.blink();

  lcd.cursor(1, 0).print("Blinking? ");
});



```





[Grove - LCD RGB w/ Backlight](http://www.seeedstudio.com/depot/grove-lcd-rgb-backlight-p-1643.html)
![Grove LCD RGB](http://www.seeedstudio.com/wiki/images/0/03/Serial_LEC_RGB_Backlight_Lcd.jpg)


<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
