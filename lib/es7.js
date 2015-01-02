if (!Array.prototype.includes) {
  Array.prototype.includes = function(needle) {
    return this.indexOf(needle) !== -1;
  };
}
