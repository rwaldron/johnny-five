var Fn = require("../fn");

var filterDefaults = {
  samples: 5,
  fixed: 2,
  deviation: 2
};

var Filtration = function (options) {
  var filterOpts = options.filter;
  var isFiltered = !!filterOpts;
  var data;

  if (!isFiltered) {
    return;
  }

  filterOpts = typeof filterOpts === "object" ?
    Object.assign({}, filterDefaults, options.filter) : filterDefaults;

  var state = {
    previous: {},
    samples: {}
  };

  this.filterable.forEach(function (prop) {
    state.previous[prop] = 0;
    state.samples[prop] = [0];
  });

  function toFixed(value) {
    return filterOpts.fixed ? Math.round(value * Math.pow(10, filterOpts.fixed)) / Math.pow(10, filterOpts.fixed) : value;
  }

  Object.defineProperties(this, {
    filtered: {
      get: function() {
        var filteredProps = {};

        this.filterable.forEach(function (el) {
          filteredProps[el] = toFixed(Fn.average(state.samples[el]));
        });

        return filteredProps;
      }
    }
  });

  this.on("data", function() {
    this.filterable.forEach(function (prop) {
      if (typeof filterOpts.deviation === "number") {
        data = state.previous[prop] && (this[prop] > state.previous[prop] * filterOpts.deviation) ?
          state.previous[prop] : this[prop];
      }

      if (state.samples[prop].length === filterOpts.samples) {
        state.samples[prop].shift();
      }

      state.samples[prop].push(this[prop]);
    }.bind(this));
  });
};

module.exports = Filtration;
