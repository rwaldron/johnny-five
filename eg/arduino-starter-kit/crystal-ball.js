var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

function CrystalBall(lcd) {
  this.lcd = lcd;
  this.next = 0;
  this.replies = ["Yes", "Most likely", "Certainly", "Outlook good", "Unsure", "Ask again", "Doubtful", "No"];
}

CrystalBall.prototype.reply = function() {
  this.lcd.clear();
  this.lcd.print("The ball says:");
  this.lcd.cursor(1, 0);
  this.next = (this.next + 1) % 8;
  this.lcd.print(this.replies[this.next]);
};

CrystalBall.prototype.ask = function() {
  this.lcd.clear();
  this.lcd.print("Ask the");
  this.lcd.cursor(1, 0);
  this.lcd.print("Crystal Ball");
};

board.on("ready", function() {
  var button = new five.Button(6);
  var lcd = new five.LCD({
    pins: [12, 11, 5, 4, 3, 2],
  });
  var crystalBall = new CrystalBall(lcd);
  crystalBall.ask();
  button.on("press", function() {
    crystalBall.reply();
  });
});
