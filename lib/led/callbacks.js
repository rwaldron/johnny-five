var noop = function() {};

module.exports = function(klass, methods) {
  // Methods with callbacks need to have the callback called
  // as a result of all entries reaching completion, not
  // calling the callback once for each entry completion.
  // Uses an array to match pattern in Led, and may be more
  // in future.
  methods.forEach(function(method) {
    klass.prototype[method] = function(duration, callback) {
      var length = this.length;
      var signals = [];
      var rgb;

      if (typeof duration === "function") {
        callback = duration;
        duration = 1000;
      }

      if (typeof callback !== "function") {
        callback = noop;
      }

      for (var i = 0; i < length; i++) {
        rgb = this[i];
        signals.push(
          /* jshint ignore:start */
          new Promise(function(resolve) {
            rgb[method](duration, function() {
              resolve();
            });
          })
          /* jshint ignore:end */
        );
      }

      Promise.all(signals).then(callback);

      return this;
    };
  });
};
