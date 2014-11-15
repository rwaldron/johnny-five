module.exports = {
  nano: function(ns) {
    var start = process.hrtime();
    while (process.hrtime() < start + ns) {}
  }
};
