if (!Array.from || !Object.assign || !Map) {
  require("es6-shim");
}
require("copy-paste");

var fs = require("fs");
var cp = require("child_process");
var shell = require("shelljs");

process.env.IS_TEST_MODE = true;

module.exports = function(grunt) {

  var task = grunt.task;
  var file = grunt.file;
  var log = grunt.log;
  var fail = grunt.fail;
  var verbose = grunt.verbose;
  var _ = grunt.util._;

  var templates = {
    changelog: _.template(file.read("tpl/.changelog.md")),
    eg: _.template(file.read("tpl/.eg.md")),
    img: _.template(file.read("tpl/.img.md")),
    breadboard: _.template(file.read("tpl/.breadboard.md")),
    eglink: _.template(file.read("tpl/.readme.eglink.md")),
    readme: _.template(file.read("tpl/.readme.md")),
    embeds: {
      youtube: _.template(file.read("tpl/.embed-youtube.html")),
    },
    program: _.template(file.read("tpl/.eg-program-template.js")),
  };

  var noedit = file.read("tpl/.noedit.md");
  var programsJson = JSON.parse(file.read("tpl/programs.json"));
  var programsList = programsJson.reduce(function(paccum, topics) {
    return paccum.concat(
      topics.examples.reduce(function(faccum, example) {
        return faccum.concat(["eg/" + example.file]);
      }, [])
    );
  }, []);


  var changedFiles = [];

  if (Number(process.versions.node.split(".")[0]) >= 4) {
    changedFiles = cp.execSync("git diff --name-only").toString().split("\n").reduce(function(accum, line) {
      var value = line.trim();
      if (value && value.endsWith(".js")) {
        accum.push(value);
      }
      return accum;
    }, []);
  }

  var primaryFiles = [
    "Gruntfile.js",
    "lib/**/!(johnny-five)*.js",
    "test/**/*.js",
  ].concat(programsList);


  if (!process.env.APPVEYOR && !process.env.TRAVIS) {
    if (changedFiles.length) {
      primaryFiles = changedFiles;
    }
  }

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    examples: {
      files: ["tpl/programs.json"]
    },
    nodeunit: {
      tests: [
        "test/bootstrap/*.js",
        "test/*.js"
      ]
    },
    jshint: {
      options: {
        jshintrc: true
      },
      files: {
        src: primaryFiles,
      }
    },
    jscs: {
      src: primaryFiles,
      options: {
        config: ".jscsrc"
      }
    },
    jsbeautifier: {
      files: primaryFiles,
      options: {
        js: {
          braceStyle: "collapse",
          breakChainedMethods: false,
          e4x: false,
          evalCode: false,
          indentChar: " ",
          indentLevel: 0,
          indentSize: 2,
          indentWithTabs: false,
          jslintHappy: false,
          keepArrayIndentation: false,
          keepFunctionIndentation: false,
          maxPreserveNewlines: 10,
          preserveNewlines: true,
          spaceBeforeConditional: true,
          spaceInParen: false,
          unescapeStrings: false,
          wrapLineLength: 0
        }
      }
    },
    watch: {
      src: {
        files: primaryFiles,
        tasks: ["default"],
        options: {
          interrupt: true,
        },
      }
    }
  });

  grunt.registerTask("example", "Create an example program, usage: \"grunt expample:<file-name>[.js]\"", function(fileName) {

    if (!fileName.endsWith(".js")) {
      fileName += ".js";
    }

    var pathAndFile = "eg/" + fileName;

    if (file.exists(pathAndFile)) {
      fail.warn(pathAndFile + " exists!");
    } else {
      file.write(pathAndFile, templates.program());
      log.writeln("Example created: %s", pathAndFile);
    }
  });

  // Support running a single test suite:
  // grunt nodeunit:just:motor for example
  grunt.registerTask("nodeunit:just", "Run a single or limited set of tests specified by a target; usage: 'grunt nodeunit:just:test-file' or 'grunt nodeunit:just:[test-file-a,test-file-b]'", function(file) {

    var config = [
      "test/bootstrap/*.js",
    ];

    if (file) {
      var files = [file];

      //
      // grunt nodeunit:just:[test-file-a,test-file-b]
      //
      if (file[0] === "[" && file[file.length - 1] === "]") {
        files = file.match(/(\w+)/g);
      }

      if (files) {
        files.forEach(function(file) {
          config.push("test/" + file + ".js");
        });

        grunt.config("nodeunit.tests", config);
      }
    }

    grunt.task.run("nodeunit");
  });

  //
  //
  // grunt beautify:file-a.js
  // grunt beautify:[file-a.js,file-b.js]
  //
  // grunt beautify:file-a
  // grunt beautify:[file-a,file-b]
  //
  grunt.registerTask("beautify", "Cleanup a single or limited set of files; usage: 'grunt beautify:file.js' or 'grunt beautify:[file-a.js,file-b.js]' (extension optional)", function(file) {
    var files;

    if (file) {
      files = [file];

      //
      // grunt beautify:[test-file-a,test-file-b]
      //
      if (file[0] === "[" && file[file.length - 1] === "]") {
        files = file.match(/(\w+)/g);
      }

      if (files) {
        for (var i = 0; i < files.length; i++) {
          if (!files[i].endsWith(".js")) {
            files[i] += ".js";
          }
        }
        grunt.config("jsbeautifier.files", files);
      }
    }

    grunt.task.run("jsbeautifier");
  });

  // Support running a complete set of tests with
  // extended (possibly-slow) tests included.
  grunt.registerTask("nodeunit:complete", function() {
    var testConfig = grunt.config("nodeunit.tests");
    testConfig.push("test/extended/*.js");
    grunt.config("nodeunit.tests", testConfig);
    grunt.task.run("nodeunit");
  });

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-nodeunit");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-jsbeautifier");
  grunt.loadNpmTasks("grunt-jscs");

  // grunt.registerTask("beautify", ["jsbeautifier"]);

  grunt.registerTask("default", ["jshint", "jscs", "nodeunit"]);
  // Explicit test task runs complete set of tests
  grunt.registerTask("test", ["jshint", "jscs", "nodeunit:complete"]);

  grunt.registerMultiTask("examples", "Generate examples", function() {
    // Concat specified files.
    var entries = JSON.parse(file.read(file.expand(this.data)));
    var readme = [];


    entries.forEach(function(entry) {
      var topic = entry.topic;

      log.writeln("Processing examples for: " + entry.topic);

      readme.push("\n### " + topic + "\n");

      entry.examples.sort(function(a, b) {
        if (a.title < b.title) {
          return -1;
        }
        if (a.title > b.title) {
          return 1;
        }
        return 0;
      }).forEach(function(example) {
        var markdown, filepath, eg, md, inMarkdown,
          images, alternates, breadboards, embeds, name, imgMarkdown, values, primary;

        markdown = [];
        filepath = "eg/" + example.file;

        if ( !example.file || !fs.existsSync(filepath) ) {
          grunt.fail.fatal("Specified example file doesn't exist: " + filepath);
        }

        eg = file.read(filepath);
        name = (example.name || example.file).replace(".js", "");

        md = "docs/" + name + ".md";
        inMarkdown = false;

        if (!example.title) {
          example.title = null;
        }

        // Modify code in example to appear as it would if installed via npm
        eg = eg.replace(/\.\.\/lib\/|\.js/g, "").split("\n").filter(function(line) {
          if (/@markdown/.test(line)) {
            inMarkdown = !inMarkdown;
            return false;
          }

          if (inMarkdown) {
            line = line.trim();
            if (line) {
              markdown.push(
                line.replace(/^\/\//, "").trim()
              );
            }
            // Filter out the markdown lines
            // from the main content.
            return false;
          }

          return true;
        }).join("\n");

        markdown = markdown.join("\n");

        // If there are photo images to include
        images = example.images || [];

        // Get list of breadboards diagrams to include (Default: same as file name)
        breadboards = example.breadboards || [{
          "name": name,
          "title": "Breadboard for \"" + example.title + "\"",
          "auto": true,
        }];

        embeds = (example.embeds || []).map(function(embed) {
          return templates.embeds[embed.type]({ src: embed.src });
        });

        // We'll combine markdown for images and breadboards
        imgMarkdown = "";

        primary = breadboards.shift();

        images.forEach(function(img) {
          if (!img.title || !img.file) {
            grunt.fail.fatal("Invalid image: title and file required");
          }

          img.filepath = "docs/images/" + img.file;
          var hasImg = fs.existsSync(img.filepath);
          if (hasImg) {
            imgMarkdown += templates.img({ img: img });
          } else {
            // If it's specified but doesn't exist, we'll consider it an error
            grunt.fail.fatal("Invalid image: " + img.file);
          }
        });

        breadboards.forEach(function(breadboard) {
          imgMarkdown += breadboardMarkdown(breadboard);
        });

        if (example.alternates) {
          alternates = example.alternates.map(function(alternate) {
            return {
              description: alternate.description || "",
              source: file.read("eg/" + alternate.file).replace("../", "johnny-five"),
              title: alternate.title || "",
            };
          });
        }

        values = {
          command: "node " + filepath,
          description: example.description,
          embeds: embeds,
          example: eg,
          alternates: alternates || [],
          externals: example.externals || [],
          file: md,
          images: imgMarkdown,
          markdown: markdown,
          primary: primary ? breadboardMarkdown(primary) : "",
          title: example.title,
          theYear: (new Date()).getUTCFullYear()
        };

        // Write the file to /docs/*
        file.write(md, templates.eg(values));

        // Push a rendered markdown link into the readme "index"
        readme.push(templates.eglink(values));
      });
    });

    // Write the readme with doc link index
    file.write("README.md",
      templates.readme({
        noedit: noedit,
        eglinks: readme.join("")
      })
    );

    log.writeln("Examples created.");
  });


  function breadboardMarkdown(breadboard) {
    if (!breadboard.name) {
      grunt.fail.fatal("Invalid breadboard: name required");
    }

    breadboard.png = "docs/breadboard/" + breadboard.name + ".png";
    breadboard.fzz = "docs/breadboard/" + breadboard.name + ".fzz";

    breadboard.hasPng = fs.existsSync(breadboard.png);
    breadboard.hasFzz = fs.existsSync(breadboard.fzz);

    if (!breadboard.hasPng) {
      if (breadboard.auto) {
        // i.e. we tried to guess at a name but still doesn't exist
        // We can just ignore and no breadboard shown
        return;
      } else {
        // A breadboard was specified but doesn't exist - error
        grunt.fail.fatal("Specified breadboard doesn't exist: " + breadboard.png);
      }
    }

    // FZZ is optional, but we'll warn at verbose
    if (!breadboard.hasFzz) {
      verbose.writeln("Missing FZZ: " + breadboard.fzz);
    }

    return templates.breadboard({ breadboard: breadboard });
  }

  // run the examples task and fail if there are uncommitted changes to the docs directory
  task.registerTask("test-examples", "Guard against out of date examples", ["examples", "fail-if-uncommitted-examples"]);

  task.registerTask("fail-if-uncommitted-examples", function() {
    task.requires("examples");
    if (shell.exec("git diff --exit-code --name-status ./docs").code !== 0) {
      grunt.fail.fatal("The generated examples don't match the committed examples. Please ensure you've run `grunt examples` before committing.");
    }
  });

  grunt.registerTask("bump", "Bump the version", function(version) {

    // THIS IS SLIGHTLY INSANE.
    //
    //
    //
    // I don't want the whole package.json file reformatted,
    // (because it makes the contributors section look insane)
    // so we're going to look at lines and update the version
    // line with either the next version of the specified version.
    //
    // It's either this or the whole contributors section
    // changes from 1 line per contributor to 3 lines per.
    //

    var pkg = grunt.file.read("package.json").split(/\n/).map(function(line) {
      var replacement, minor, data;

      if (/version/.test(line)) {
        data = line.replace(/"|,/g, "").split(":")[1].split(".");

        if (version) {
          replacement = version;
        } else {
          minor = +data[2];
          data[2] = ++minor;
          replacement = data.join(".").trim();
        }

        copy(replacement);

        return "  \"version\": \"" + replacement + "\",";
      }

      return line;
    });

    grunt.file.write("package.json", pkg.join("\n"));

    // TODO:
    //
    //  - git commit with "vX.X.X" for commit message
    //  - npm publish
    //
    //
  });

  grunt.registerTask("changelog", "Generate a changelog. Range: changelog:v0.0.0--v0.0.2; Current: changelog:v0.0.2", function(version) {
    var done = this.async();
    var temp = "";
    var previous = "";
    var thisPatch;
    var lastPatch;

    if (!version) {
      version = grunt.config("pkg.version");
    }

    if (version.includes("--")) {
      /*
        Example:

          grunt changelog:v0.8.71--v0.8.73

       */
      temp = version.split("--");
      previous = temp[0];
      version = temp[1];
    } else {
      /*
        Example:

          grunt changelog
          grunt changelog:v0.8.73

       */
      thisPatch = version.replace(/^v/, "").split(".").pop();
      lastPatch = Number(thisPatch) - 1;
      previous = version.replace(thisPatch, lastPatch);
      version = "HEAD";
    }

    cp.exec("git log --format='%H|%h|%an|%s' " + previous + ".." + version, function(error, result) {
      if (error) {
        console.log(error.message);
        return;
      }

      var commits = result.split("\n")
        .filter(function(cmt) { return cmt.trim() !== ""; })
        .map(function(cmt) { return cmt.split("|"); });

      var rows = commits.reduce(function(accum, commit) {
        if (commit[3].indexOf("Merge") === 0) {
          return accum;
        }
        accum += "| https://github.com/rwaldron/johnny-five/commit/" + commit[0] + " | " + commit[3] + " |\n";

        return accum;
      }, "");

      log.writeln(templates.changelog({ rows: rows }));

      done();
    });
  });
};
