/**
 * This atrocity is unfortunately necessary.
 * If any other approach can be found, patches
 * will gratefully be accepted.
 */
const sleep = {
  micro(us) {
    const start = process.hrtime();
    let waited = 0;
    let delta;

    while (us > waited) {
      delta = process.hrtime(start);
      waited = (delta[0] * 1E9 + delta[1]) / 1000;
    }
  },
  milli(ms) {
    sleep.micro(ms * 1000);
  }
};

module.exports = sleep;
