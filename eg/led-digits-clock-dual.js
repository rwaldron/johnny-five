const moment = require("moment");
const { Board, Led } = require("../lib/johnny-five");

const board = new Board();

board.on("ready", () => {
  const hmm = new Led.Digits({
    controller: "HT16K33",
  });
  const seconds = new Led.Digits({
    pins: {
      data: 2,
      cs: 3,
      clock: 4,
    }
  });

  let minute = null;
  let toggle = 0;

  setInterval(() => {
    const now = moment();
    const min = now.minute();
    let form;

    if (minute !== min) {
      minute = min;
      form = (toggle ^= 1) ? "h:mm" : "hmm";
      hmm.print((" " + now.format(form)).slice(-5));
    }
    seconds.print("  " + now.format("ss.SSSS"));
  }, 200);
});
/* @markdown

Learn More:

- [JavaScript: A Digital Clock with Johnny-Five](http://bocoup.com/weblog/javascript-arduino-digital-clock-johnny-five/)

@markdown */
