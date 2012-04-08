#Firmata
A Node library to interact with an Arduino running the firmata protocol.
#Install
    npm install -g firmata
#Tests
The tests are written with expresso and assume you have the async library install globally.  It also assumes you have an Arduino Uno running firmata 2.2 with a photocell and an LED hooked up.
#Usage
    
    var firmata = require('firmata');
    var board = new firmata.Board('path to usb',function(){
      //arduino is ready to communicate
    });  
#REPL
If you run *firmata* from the command line it will prompt you for the usb port.  Then it will present you with a REPL with a board variable available.
#Board
  The Board object is where all the functionality is for the library.
##attributes
  *Board.MODES*
    
    {
     INPUT:0x00,
     OUTPUT:0x01,
     ANALOG:0x02,
     PWM:0x03,
     SERVO:0x04   
    }
  This is an enumeration of the different modes available.  This are used in calls to the *pinMode* function.

  *Board.HIGH* and *Board.LOW*

  These are constants used to set a digital pin low or high.  Used in calls to the *digitalWrite* function.

  *Board.pins*

  This is an array of all the pins on the arduino board.

  Each value in the array is an object:

    {
     mode://current mode of pin which is on the the board.MODES.
    ,value://current value of the pin. when pin is digital and set to output it will be Board.HIGH or Board.LOW.  If the pin is an analog pin it will be an numeric value between 0 and 1023.
    ,supportedModes://an array of modes from board.MODES that are supported on this pin.
    ,analogChannel://will be 127 for digital pins and the pin number for analog pins.
    }

  This array holds all pins digital and analog. To get the analog pin number as seen on the arduino board use the analogChannel attribute.

  *Board.analogPins*

  This is an array of all the array indexes of the analog pins in the *Board.pins* array.  
  For example to get the analog pin 5 from the *Board.pins* attributes use:

    board.pins[board.analogPins[5]];
##methods
    board.pinMode(pin,mode)

  Set a mode for a pin.  pin is the number of the pin and the mode is on of the Board.MODES values.

    board.digitalWrite(pin,value)

  Write an output to a digital pin.  pin is the number of the pin and the value is either board.HGH or board.LOW.

    board.digitalRead(pin,callback)

  Read a digital value from the pin.  Evertime there is data for the pin the callback will be fired with a value argument.  

    board.analogWrite(pin,value)

  Write an output to a digital pin.  pin is the number of the pin and the value is between 0 and 255.  

    board.analogRead(pin,callback)

  Read an input for an analog pin.  Every time there is data on the pin the callback will be fired with a value argument. 

    board.servoWrite(pin,degree)
  Set I2C Config on the arduino
  
    board.sendI2CConfig(delay)

  Write a degree value to a servo pin.

    board.sendI2CWriteRequest(slaveAddress,[bytes])

  Write an array of bytes to a an I2C device.

    board.sendI2CReadRequest(slaveAddress,numBytes,function(data))

  Requests a number of bytes from a slave I2C device.  When the bytes are received from the I2C device the callback is called with the byte array.
  *note* You must use the latest version of firmata seen here http://firmata.svn.sourceforge.net/viewvc/firmata/arduino/trunk/Firmata/examples/StandardFirmata/ for I2C Support.
## License 

(The MIT License)

Copyright (c) 2011 Julian Gautier &lt;julian.gautier@alumni.neumont.edu&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.