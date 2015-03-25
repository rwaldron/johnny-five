require("copy-paste");

var inspect = require("util").inspect;
var fs = require("fs");
var shell = require("shelljs");

process.env.IS_TEST_MODE = true;

module.exports = function(grunt) {

  var task = grunt.task;
  var file = grunt.file;
  var log = grunt.log;
  var verbose = grunt.verbose;
  var fail = grunt.fail;
  var option = grunt.option;
  var config = grunt.config;
  var template = grunt.template;
  var _ = grunt.util._;

  var templates = {
    eg: _.template(file.read("tpl/.eg.md")),
    img: _.template(file.read("tpl/.img.md")),
    fritzing: _.template(file.read("tpl/.fritzing.md")),
    eglink: _.template(file.read("tpl/.readme.eglink.md")),
    readme: _.template(file.read("tpl/.readme.md")),
    noedit: _.template(file.read("tpl/.noedit.md")),
    plugin: _.template(file.read("tpl/.plugin.md")),
  };

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    examples: {
      files: ["tpl/programs.json"]
    },
    nodeunit: {
      // remove test/distance.js (and this exception) when bumping to 0.9.0
      tests: ["test/*.js", "!test/mock*", "!test/distance.js"]
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: false,
        newcap: false,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        strict: false,
        esnext: true,
        globals: {
          exports: true,
          document: true,
          $: true,
          Radar: true,
          WeakMap: true,
          window: true,
          copy: true
        }
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
    var path = require("path");
    if (file) {
      grunt.config("nodeunit.tests", [
        path.join("test", path.basename(file, ".js") + ".js")
      ]);
    }

    grunt.task.run("nodeunit");
  });

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-nodeunit");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-jsbeautifier");
  grunt.loadNpmTasks("grunt-jscs");

  grunt.registerTask("default", ["jshint", "jscs", "nodeunit"]);

  grunt.registerMultiTask("examples", "Generate examples", function() {
    // Concat specified files.
    var entries = JSON.parse(file.read(file.expand(this.data)));
    var titles = JSON.parse(file.read("tpl/titles.json"));
    var readme = [];
    var tplType = "eg";

    entries.forEach(function(entry) {

      var topic = entry.topic;
      var tplType = entry.tplType || "eg";

      readme.push("\n### " + topic + "\n");

      entry.files.forEach(function(value) {

        var markdown = [];
        var filepath = "eg/" + value;
        var eg = file.read(filepath);
        var md = "docs/" + value.replace(".js", ".md");
        var png = "docs/breadboard/" + value.replace(".js", ".png");
        var fzz = "docs/breadboard/" + value.replace(".js", ".fzz");
        var fritzpath = fzz.split("/");
        var fritzfile = fritzpath[fritzpath.length - 1];
        var inMarkdown = false;

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

        var hasPng = fs.existsSync(png);
        var hasFzz = fs.existsSync(fzz);

        // console.log( markdown );

        var values = {
          title: titles[value],
          command: "node " + filepath,
          example: eg,
          file: md,
          markdown: markdown.join("\n"),
          breadboard: hasPng ? templates.img({ png: png }) : "",
          fritzing: hasFzz ? templates.fritzing({ fzz: fzz }) : ""
        };

        if (titles[value]) {
          // Write the file to /docs/*
          file.write(md, templates[tplType](values));

          // Push a rendered markdown link into the readme "index"
          readme.push(templates.eglink(values));
        }
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

        return '  "version": "' + replacement + '",';
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
