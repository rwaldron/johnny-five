#!/usr/bin/env node

const serialport = require("serialport");
const SerialPort = serialport.SerialPort;
const readline = serialport.parsers.readline;
const optimist = require("optimist");
const async = require("async");

/**
 * This program will setup an xbee 802.15.4 (series 1) to talk serially at 57600bps
 * which is the baud rate firmata likes. Currently it just prints system info.
 *
 * See http://www.ladyada.net/make/xbee/arduino.html
 * See http://ftp1.digi.com/support/documentation/90000982_L.pdf
 */

const args = optimist
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
  process.exit(-1);
}

if (!args.portname) {
  console.error("Serial port name is required. \n `-p /dev/PORTNAME` \n Use one of the following");
  serialport.list().then(results => {
    results.forEach(({path}) => console.log(`\t${path}`));
  });
  process.exit(-1);
}

const guardTime = args.guardtime * 1000;

const openOptions = {
  baudRate: args.baud,
  dataBits: args.databits,
  parity: args.parity,
  stopBits: args.stopbits,
  parser: readline("\r")
};

const port = new SerialPort(args.portname, openOptions);

const open = cb => {
  console.log("port open!");
  port.once("open", cb);
};

const wait = ms => cb => {
  setTimeout(cb, ms);
};

const sendCmd = str => cb => {
  port.once("data", data => {
    if (data === "OK") {
      cb(null, data);
    } else {
      cb(new Error("Not OK"));
    }
  });
  port.write(str);
};

const readCmd = str => cb => {
  port.once("data", data => {
    cb(null, data);
  });
  port.write(str);
};

const exit = () => {
  console.log("quiting");
  // port.close();
  process.exit(0);
};

const print = str => cb => {
  console.log(str);
  cb();
};

const printCmd = (msg, str) => cb => {
  readCmd(`${str}\r`)((err, data) => {
    console.log(`${msg} (${str}): ${data}`);
    cb();
  });
};

const systemInfo = cb => {
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

const cmdMode = cb => {
  wait(guardTime)(
    sendCmd("+++")(
      cb
    )
  );
};

const exitCmdMode = cb => {
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

