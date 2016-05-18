/**
 * Many pins have common aliases, especially SPI!
 */

var MISO = "miso";
var MOSI = "mosi";
var SCLK = "sclk";
var SS = "ss";

// jshint unused:false
var aliases = {

  // SCLK
  clk: SCLK,
  clock: SCLK,
  sclk: SCLK,

  // MISO
  somi: MISO,
  sdo: MISO,
  do: MISO,
  dout: MISO,
  so: MISO,
  mrsr: MISO,
  miso: MISO,

  // MOSI
  simo: MOSI,
  sdi: MOSI,
  data: MOSI,
  di: MOSI,
  din: MOSI,
  si: MOSI,
  mtst: MOSI,
  mosi: MOSI,

  // SS
  ncs: SS,
  cs: SS,
  csb: SS,
  csn: SS,
  en: SS,
  ld: SS,
  load: SS,
  nss: SS,
  ste: SS,
  sync: SS,
  ss: SS,
};


/**
 * Options
 *
 * @param {String} arg Pin address.
 * @param {Number} arg Pin address.
 * @param {Array} arg List of Pin addresses.
 *
 * @return {Options} normalized board options instance.
 */

function Options(arg) {
  if (!(this instanceof Options)) {
    return new Options(arg);
  }

  var opts = {};

  if (typeof arg === "number" ||
    typeof arg === "string") {
    opts.pin = arg;
  } else if (Array.isArray(arg)) {
    opts.pins = arg;
  } else {
    opts = arg;


    // @Nick, this is where you want to focus.
    // Anytime this path is taken, the constructor
    // received an object. If the object contains
    // a "pins" property that is ALSO an object, we need
    // to normalize the keys of that object, using the
    // "aliases" map defined above.
    //
    // This change will require renaming pin properties in
    // a few classes, but I'm ok with that, because if we do this
    // right, no existing code will break.
    //
  }

  Object.assign(this, opts);
}

module.exports = Options;
