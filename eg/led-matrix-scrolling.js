var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {

  var matrix = new five.LedControl({
    pins: {
      data: 2,
      clock: 3,
      cs: 4
    },
    isMatrix: true,
    devices: 2
  });

  matrix.on();

  var message = "h".split("");


  // function rotty(start) {
  //   var result = [0, 0, 0, 0, 0, 0, 0, 0];

  //   // console.log( start );

  //   for (var i = 0; i < 8; i++) {
  //     for (var j = 0; j < 8; j++) {
  //       // result[i] = result[i] & start[j][7-i];
  //       // console.log(  result[i], (result[i] >> 1) );
  //       // result[i] = (result[i] >> 1)
  //       // console.log( i, start[j] >> i );

  //       // (result[i] << 1) | ((start[j] >> (7 - i)) & 0x01);
  //       result[i] = (result[i] << 1) | ((start[j] >> (7 - i)) & 0x01);
  //     }
  //       // result[0] += start[i][7];
  //       // result[1] += start[i][6];
  //       // result[2] += start[i][5];
  //       // result[3] += start[i][4];
  //       // result[4] += start[i][3];
  //       // result[5] += start[i][2];
  //       // result[6] += start[i][1];
  //       // result[7] += start[i][0];
  //   }

  //   return result;
  // }



  function padLeft(s, l, c) {
    s = String(s);
    return (new Array(l - s.length + 1)).join(c || " ") + s;
  }

  rotate.ccw = function(a) {
    var n = a.length;
    for (var i = 0; i < n / 2; i++) {
      for (var j = i; j < n - i - 1; j++) {
        var tmp = a[i][j];
        a[i][j] = a[j][n - i - 1];
        a[j][n - i - 1] = a[n - i - 1][n - j - 1];
        a[n - i - 1][n - j - 1] = a[n - j - 1][i];
        a[n - j - 1][i] = tmp;
      }
    }
    return a;
  };
  rotate.cw = function(a) {
    var n = a.length;
    for (var i = 0; i < n / 2; i++) {
      for (var j = i; j < n - i - 1; j++) {
        var tmp = a[i][j];
        a[i][j] = a[n - j - 1][i];
        a[n - j - 1][i] = a[n - i - 1][n - j - 1];
        a[n - i - 1][n - j - 1] = a[j][n - i - 1];
        a[j][n - i - 1] = tmp;
      }
    }
  };

  function rotate(bitsIn, dir) {
    dir = dir || "ccw";
    return rotate[dir](bitsIn.map(function(num) {
      return padLeft(num.toString(2), 8, "0").split("");
    })).map(function(bits) {
      return parseInt(String(bits), 2);
      // return parseInt(bits.join(""), 2);
    });
  }


  // function rotty(start) {
  //   var result = [0, 0, 0, 0, 0, 0, 0, 0];

  //   // console.log( start );

  //   for (var i = 0; i < 8; i++) {
  //     for (var j = 0; j < 8; j++) {
  //       // result[i] = result[i] & start[j][7-i];
  //       // console.log(  result[i], (result[i] >> 1) );
  //       // result[i] = (result[i] >> 1)
  //       // console.log( i, start[j] >> i );

  //       // (result[i] << 1) | ((start[j] >> (7 - i)) & 0x01);
  //       result[i] = (result[i] << 1) | ((start[j] >> (7 - i)) & 0x01);
  //     }
  //       // result[0] += start[i][7];
  //       // result[1] += start[i][6];
  //       // result[2] += start[i][5];
  //       // result[3] += start[i][4];
  //       // result[4] += start[i][3];
  //       // result[5] += start[i][2];
  //       // result[6] += start[i][1];
  //       // result[7] += start[i][0];
  //   }

  //   return result;
  // }

  // function rotate(bitsIn) {
  //   var bits = bitsIn.map(function(num) {
  //     return padLeft(num.toString(2), 8, "0");
  //   });

  //   var result = ["", "", "", "", "", "", "", ""];


  // console.log( bits );

  //   for (var i = 0; i < 8; i++) {
  //     result[i] += bits[i][7];
  //     result[i] += bits[i][6];
  //     result[i] += bits[i][5];
  //     result[i] += bits[i][4];
  //     result[i] += bits[i][3];
  //     result[i] += bits[i][2];
  //     result[i] += bits[i][1];
  //     result[i] += bits[i][0];



  //     // for (var j = 7; j >= 0; j--) {
  //     //   console.log( bits[j] );
  //     //   result[i] += bits[j];
  //     // }
  //   }

  //   // console.log( result );

  //   return result;
  // }


  // function next() {
  //   var c;

  //   if (c = message.shift()) {
  //     matrix.draw(c);
  //     setTimeout(next, 500);
  //   }
  // }

  // next();


  var injection = {
    r: function(c) {
      var char;
      if (char = five.LedControl.MATRIX_CHARS[c]) {
        matrix.draw(0, rotate(char));
        matrix.draw(1, char);

      }
    },
    d: function(c) {
      matrix.draw(1, c);
    },

    matrix: matrix
  };

  var chars = Object.keys(five.LedControl.MATRIX_CHARS).slice(32);
  var index = 1;

  setInterval(function() {
    injection.r(chars[index++]);
  }, 1000);



  this.repl.inject(injection);
});


// void scrollFont() {
//     for (int counter=0x20;counter<0x80;counter++){
//         loadBufferLong(counter);
//         delay(500);
//     }
// }

// // Scroll Message
// void scrollMessage(prog_uchar * messageString) {
//     int counter = 0;
//     int myChar=0;
//     do {
//         // read back a char
//         myChar =  pgm_read_byte_near(messageString + counter);
//         if (myChar != 0){
//             loadBufferLong(myChar);
//         }
//         counter++;
//     }
//     while (myChar != 0);
// }
// // Load character into scroll buffer
// void loadBufferLong(int ascii){
//     if (ascii >= 0x20 && ascii <=0x7f){
//         for (int a=0;a<7;a++){                      // Loop 7 times for a 5x7 font
//             var c = pgm_read_byte_near(font5x7 + ((ascii - 0x20) * 8) + a);     // Index into character table to get row data
//             var x = bufferLong [a*2];     // Load current scroll buffer
//             x = x | c;                              // OR the new character onto end of current
//             bufferLong [a*2] = x;                   // Store in buffer
//         }
//         byte count = pgm_read_byte_near(font5x7 +((ascii - 0x20) * 8) + 7);     // Index into character table for kerning data
//         for (byte x=0; x<count;x++){
//             rotateBufferLong();
//             printBufferLong();
//             delay(scrollDelay);
//         }
//     }
// }
// // Rotate the buffer
// void rotateBufferLong(){
//     for (int a=0;a<7;a++){                      // Loop 7 times for a 5x7 font
//         var x = bufferLong [a*2];     // Get low buffer entry
//         byte b = bitRead(x,31);                 // Copy high order bit that gets lost in rotation
//         x = x<<1;                               // Rotate left one bit
//         bufferLong [a*2] = x;                   // Store new low buffer
//         x = bufferLong [a*2+1];                 // Get high buffer entry
//         x = x<<1;                               // Rotate left one bit
//         bitWrite(x,0,b);                        // Store saved bit
//         bufferLong [a*2+1] = x;                 // Store new high buffer
//     }
// }
// // Display Buffer on LED matrix
// void printBufferLong(){
//   for (int a=0;a<7;a++){                    // Loop 7 times for a 5x7 font
//     var x = bufferLong[a*2+1];   // Get high buffer entry
//     var y = x;                             // Mask off first character
//     lc.row(3,a,y);                       // Send row to relevent MAX7219 chip
//     x = bufferLong[a*2];                   // Get low buffer entry
//     y = (x>>24);                            // Mask off second character
//     lc.row(2,a,y);                       // Send row to relevent MAX7219 chip
//     y = (x>>16);                            // Mask off third character
//     lc.row(1,a,y);                       // Send row to relevent MAX7219 chip
//     y = (x>>8);                             // Mask off forth character
//     lc.row(0,a,y);                       // Send row to relevent MAX7219 chip
//   }
// }
