var fs = require('fs'),
    path = require('path'),
    argsparser = require('argsparser'),
    hint = require('./hint');

function existsSync() {
    var obj = fs.existsSync ? fs : path;
    return obj.existsSync.apply(obj, arguments);
}

function _help() {
    process.stdout.write(fs.readFileSync(__dirname + "/../HELP", "utf-8"));
}

function _version() {
    process.stdout.write(JSON.parse(fs.readFileSync(__dirname + "/../package.json", "utf-8")).version + "\n");
}

function _removeJsComments(str) {
    str = str || '';
    str = str.replace(/\/\*[\s\S]*(?:\*\/)/g, ''); //everything between "/* */"
    str = str.replace(/\/\/[^\n\r]*/g, ''); //everything after "//"
    return str;
}

function _loadAndParseConfig(filePath) {
    return existsSync(filePath) ?
            JSON.parse(_removeJsComments(fs.readFileSync(filePath, "utf-8"))) : {};
}

function _mergeConfigs(homerc, cwdrc) {
    var homeConfig = _loadAndParseConfig(homerc),
        cwdConfig = _loadAndParseConfig(cwdrc),
        prop;

    for (prop in cwdConfig) {
        if (typeof prop === 'string') {
            if (prop === 'predef') {
                homeConfig.predef = (homeConfig.predef || []).concat(cwdConfig.predef);
            } else {
                homeConfig[prop] = cwdConfig[prop];
            }
        }
    }

    return homeConfig;
}

function _print(results) {
    function exit() {
        process.exit(results.length > 0 ? 1 : 0);
    }

    // avoid stdout cutoff in node 0.4.x, also supports 0.5.x
    // see https://github.com/joyent/node/issues/1669
    try {
        if (!process.stdout.flush()) {
            process.stdout.once("drain", exit);
        } else {
            exit();
        }
    } catch (e) {
        exit();
    }
}

module.exports = {
    interpret: function (args) {
        var config, reporter, ignore,
            options = argsparser.parse(args),
            pathsToIgnore = path.join(process.cwd(), '.jshintignore'),
            defaultConfig = path.join(process.env.HOME, '.jshintrc'),
            projectConfig = path.join(process.cwd(), '.jshintrc'),
            customConfig = options["--config"],
            customReporter = options["--reporter"] ? path.resolve(process.cwd(), options["--reporter"]) : null,
            targets = options.node;
       
        //could be on Windows which we are looking for an attribute ending in 'node.exe'
        if (targets === undefined) {
            (function () {
                var arg;

                for (arg in options) {
                    if (path.basename(arg) === 'node.exe') {
                        targets = options[arg];
                        break;
                    }
                }
            }());
        }

        targets = typeof targets === "string" ? null : targets.slice(1);


        if (options["--version"]) {
            _version();
            return;
        }

        if (!targets || options["--help"]) {
            _help();
            return;
        }

        if (options["--jslint-reporter"]) {
            customReporter = "./reporters/jslint_xml.js";
        }

        if (options["--show-non-errors"]) {
            customReporter = "./reporters/non_error.js";
        }

        if (customConfig) {
            config = _loadAndParseConfig(customConfig);
        } else {
            config = _mergeConfigs(defaultConfig, projectConfig);
        }

        if (customReporter) {
            try {
                reporter = require(customReporter).reporter;
            } catch (r) {
                process.stdout.write("Error opening reporter file: " + customReporter);
                process.stdout.write(r + "\n");
                process.exit(1);
            }
        }

        if (existsSync(pathsToIgnore)) {
            ignore = fs.readFileSync(pathsToIgnore, "utf-8").split("\n").map(function (line) {
                return line.trim();
            }).filter(function (line) {
                return !!line;
            });
        }

        _print(hint.hint(targets, config, reporter, ignore));
    }
};

