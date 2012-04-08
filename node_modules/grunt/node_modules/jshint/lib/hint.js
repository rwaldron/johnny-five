var fs = require('fs'),
    minimatch = require('minimatch'),
    path = require('path'),
    jshint = require('./../packages/jshint/jshint.js'),
    _reporter = require('./reporters/default').reporter,
    _cache = {
        directories: {}
    };

function _lint(file, results, config, data) {
    var buffer,
        lintdata;

    try {
        buffer = fs.readFileSync(file, 'utf-8');
    } catch (e) {
        process.stdout.write("Error: Cant open: " + file);
        process.stdout.write(e + '\n');
    }

    // Remove potential Unicode Byte Order Mark.
    buffer = buffer.replace(/^\uFEFF/, '');

    if (!jshint.JSHINT(buffer, config)) {
        jshint.JSHINT.errors.forEach(function (error) {
            if (error) {
                results.push({file: file, error: error});
            }
        });
    }

    lintdata = jshint.JSHINT.data();

    if (lintdata) {
        lintdata.file = file;
        data.push(lintdata);
    }
}

function isDirectory(aPath) {
    var isDir;

    try {
        if (_cache.directories.hasOwnProperty(aPath)) {
            isDir = _cache.directories[aPath];
        } else {
            isDir = fs.statSync(aPath).isDirectory();
            _cache.directories[aPath] = isDir;
        }
    } catch (e) {
        isDir = false;
    }

    return isDir;
}


function _shouldIgnore(somePath, ignore) {
    function isIgnored(p) {
        var fnmatch = minimatch(somePath, p, {nocase: true}),
            lsmatch = isDirectory(p) && p.match(/^[^\/]*\/?$/) &&
                somePath.match(new RegExp("^" + p + ".*"));

        return !!(fnmatch || lsmatch);
    }

    return ignore.some(function (ignorePath) {
        return isIgnored(ignorePath);
    });
}

function _collect(filePath, files, ignore) {
    if (ignore && _shouldIgnore(filePath, ignore)) {
        return;
    }

    if (fs.statSync(filePath).isDirectory()) {
        fs.readdirSync(filePath).forEach(function (item) {
            _collect(path.join(filePath, item), files, ignore);
        });
    } else if (filePath.match(/\.js$/)) {
        files.push(filePath);
    }
}

module.exports = {
    hint: function (targets, config, reporter, ignore) {
        var files = [],
            results = [],
            data = [];

        targets.forEach(function (target) {
            _collect(target, files, ignore);
        });

        files.forEach(function (file) {
            _lint(file, results, config, data);
        });

        _cache = {
            directories: {}
        };

        (reporter || _reporter)(results, data);

        return results;
    }
};
