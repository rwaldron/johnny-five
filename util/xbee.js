#!/usr/bin/env node

var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var readline = serialport.parsers.readline;
var optimist = require("optimist");
var async = require("async");

/**
 * This program will setup an xbee 802.15.4 (series 1) to talk serially at 57600bps
 * which is the baud rate firmata likes. Currently it just prints system info.
 *
 * See http://www.ladyada.net/make/xbee/arduino.html
 * See http://ftp1.digi.com/support/documentation/90000982_L.pdf
 */

var args = optimist
  .alias("h", "help")
  .alias("h", "?")
  .options("portname", {
    alias: "p",
    describe: "Name of serial port."
  })
  .options("baud", {
    describe: "Baud rate.",
    default: 9600
  })
  .options("databits", {
    describe: "Data bits.",
    default: 8
  })
  .options("parity", {
    describe: "Parity.",
    default: "none"
  })
  .options("stopbits", {
    describe: "Stop bits.",
    default: 1
  }) // see rf module config
  .options("guardtime", {
    describe: "XBEE Guard Time (seconds)",
    default: 1
  })
  .argv;

if (args.help) {
  optimist.showHelp();
  return process.exit(-1);
}

if (!args.portname) {
  console.error("Serial port name is required. \n `-p /dev/PORTNAME` \n Use one of the following");
  serialport.list(function(err, data){
    data.forEach(function(v){
      console.log("\t" + v.comName);
    });
    return process.exit(-1);
  });
  return;
}

var guardTime = args.guardtime * 1000;

var openOptions = {
  baudRate: args.baud,
  dataBits: args.databits,
  parity: args.parity,
  stopBits: args.stopbits,
  parser: readline("\r")
};

var port = new SerialPort(args.portname, openOptions);

var open = function (cb) {
  console.log("port open!");
  port.once("open", cb);
};

var wait = function(ms) {
  return function(cb) {
    setTimeout(cb, ms);
  };
};

var sendCmd = function (str) {
  return function (cb) {
    port.once("data", function (data) {
      if (data === "OK") {
        cb(null, data);
      } else {
        cb(new Error("Not OK"));
      }
    });
    port.write(str);
  };
};

var readCmd = function (str) {
  return function (cb) {
    port.once("data", function (data) {
      cb(null, data);
    });
    port.write(str);
  };
};

var exit = function () {
  console.log("quiting");
  // port.close();
  process.exit(0);
};

var print = function(str) {
  return function(cb){
    console.log(str);
    cb();
  };
};

var printCmd = function(msg, str) {
  return function (cb) {
    readCmd(str + "\r")(function(err, data){
      console.log(msg + " (" + str + "): " + data);
      cb();
    });
  };
};

var systemInfo = function (cb) {
  async.series([
    print("System Information"),
    printCmd("\tVersion Info", "ATVR"),
    printCmd("\tBaud Rate", "ATBD"),
    printCmd("\tPAN ID (unique device id)", "ATID"),
    printCmd("\tNetworking Source Address", "ATMY"),
    printCmd("\tNetworking Destination Address", "ATDL"),
    printCmd("\tDigital I/O Config Pin 3", "ATD3"),
    printCmd("\tPacketization Timeout", "ATRO"),
    cb
  ]);
};

var cmdMode = function (cb) {
  wait(guardTime)(
    sendCmd("+++")(
      cb
    )
  );
};

var exitCmdMode = function (cb) {
  sendCmd("ATCN\r")(cb);
};

async.series([
  open,
  cmdMode,
  systemInfo,
  // readCmd("ATBD\r"),
  // // sendCmd("ATBD 6\r"),
  // readCmd("ATBD\r"),
  // sendCmd("ATWR\r"),
  exitCmdMode,
  exit
]);

