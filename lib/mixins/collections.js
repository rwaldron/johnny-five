var mixins = {
  push: function() {
    var length = this.length;
    var aLen = arguments.length;

    for (var i = 0; i < aLen; i++) {
      if (arguments[i] instanceof this.type) {
        this[length++] = arguments[i];
      }
    }

    return (this.length = length);
  },
  each: function(callbackFn) {
    var length = this.length;

    for (var i = 0; i < length; i++) {
      callbackFn.call(this[i], this[i], i);
    }

    return this;
  }
};

module.exports = mixins;
