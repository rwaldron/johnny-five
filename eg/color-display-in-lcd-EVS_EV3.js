const {Board, Color, LCD} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const lcd = new LCD({
    controller: "JHD1313M1"
  });

  const color = new Color({
    controller: "EVS_EV3",
    pin: "BAS1"
  });

  color.on("change", () => {
    lcd.bgColor(color.rgb);
  });
});
