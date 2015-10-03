require("copy-paste");

var fs = require("fs");
var shell = require("shelljs");

process.env.IS_TEST_MODE = true;

module.exports = function(grunt) {

  var task = grunt.task;
  var file = grunt.file;
  var log = grunt.log;
  var verbose = grunt.verbose;
  var _ = grunt.util._;

  var templates = {
    eg: _.template(file.read("tpl/.eg.md")),
    img: _.template(file.read("tpl/.img.md")),
    breadboard: _.template(file.read("tpl/.breadboard.md")),
    eglink: _.template(file.read("tpl/.readme.eglink.md")),
    readme: _.template(file.read("tpl/.readme.md")),
    noedit: _.template(file.read("tpl/.noedit.md")),
    embeds: {
      youtube: _.template(file.read("tpl/.embed-youtube.html")),
    }
  };

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
        src: [
          "Gruntfile.js",
          "lib/**/!(johnny-five)*.js",
          "test/**/*.js",
          "eg/**/*.js",
          "wip/autobot-2.js"
        ]
      }
    },
    jscs: {
      src: [
        "Gruntfile.js",
        "lib/**/!(johnny-five)*.js",
        "test/**/*.js",
        "eg/**/*.js",
        "util/**/*.js"
      ],
      options: {
        config: ".jscsrc"
      }
    },
    jsbeautifier: {
      files: ["lib/**/*.js", "eg/**/*.js", "test/**/*.js"],
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
        files: [
          "Gruntfile.js",
          "lib/**/!(johnny-five)*.js",
          "test/**/*.js",
          "eg/**/*.js"
        ],
        tasks: ["default"],
        options: {
          interrupt: true,
        },
      }
    }
  });

  // Support running a single test suite:
  // grunt nodeunit:just:motor for example
  grunt.registerTask("nodeunit:just", "Run a single test specified by a target; usage: \"grunt nodeunit:just:<module-name>[.js]\"", function(file) {
    if (file) {
      grunt.config("nodeunit.tests", [
        "test/bootstrap/*.js",
        "test/" + file + ".js",
      ]);
    }

    grunt.task.run("nodeunit");
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

      entry.examples.forEach(function(example) {
        var markdown, filepath, eg, md, inMarkdown,
          images, breadboards, embeds, name, imgMarkdown, values;

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
          grunt.fail.fatal("Invalid example (" + name + "): title required");
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
          "auto": true
        }];

        embeds = (example.embeds || []).map(function(embed) {
          return templates.embeds[embed.type]({ src: embed.src });
        });

        // We'll combine markdown for images and breadboards
        imgMarkdown = "";

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

          if (!breadboard.name) {
            grunt.fail.fatal("Invalid breadboard: name required");
          }

          if (!breadboard.title) {
            grunt.fail.fatal("Invalid breadboard (" + breadboard.name + "): title required");
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

          imgMarkdown += templates.breadboard({ breadboard: breadboard });
        });

        values = {
          title: example.title,
          description: example.description,
          command: "node " + filepath,
          example: eg,
          file: md,
          markdown: markdown,
          images: imgMarkdown,
          embeds: embeds,
          externals: example.externals || []
        };

        // Write the file to /docs/*
        file.write(md, templates.eg(values));

        // Push a rendered markdown link into the readme "index"
        readme.push(templates.eglink(values));
      });
    });

    // Write the readme with doc link index
    file.write("README.md",
      templates.noedit() +
      templates.readme({ eglinks: readme.join("") })
    );

    log.writeln("Examples created.");
  });

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
};
