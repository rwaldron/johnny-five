require("copy-paste");

var inspect = require("util").inspect;
var fs = require("fs");


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
    doc: _.template( file.read("tpl/.docs.md") ),
    img: _.template( file.read("tpl/.img.md") ),
    fritzing: _.template( file.read("tpl/.fritzing.md") ),
    doclink: _.template( file.read("tpl/.readme.doclink.md") ),
    readme: _.template( file.read("tpl/.readme.md") )
  };


  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    docs: {
      files: ["programs.json"]
    },
    nodeunit: {
      tests: [
        "test/bootstrap.js",
        "test/board.js",
        "test/board-connection.js",
        "test/compass.js",
        "test/options.js",
        "test/board.pins.js",
        "test/capabilities.js",
        // ------------------
        "test/accelerometer.js",
        "test/animation.js",
        "test/button.js",
        "test/distance.js",
        "test/esc.js",
        "test/fn.js",
        "test/gyro.js",
        "test/lcd.js",
        "test/led.js",
        "test/ledcontrol.js",
        "test/motor.js",
        "test/pin.js",
        "test/piezo.js",
        "test/ping.js",
        "test/pir.js",
        "test/relay.js",
        "test/sensor.js",
        "test/servo.js",
        "test/shiftregister.js",
        "test/sonar.js",
        "test/stepper.js",
        "test/switch.js"
      ]
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
      files: {
        src: [
          "lib/**/!(johnny-five)*.js",
          "test/**/*.js",
          "eg/**/*.js",
          ]
      },
      options: {
        config: ".jscsrc",
        requireCurlyBraces: [
          "if",
          "else",
          "for",
          "while",
          "do",
          "try",
          "catch",
        ],
        requireSpaceBeforeBlockStatements: true,
        requireParenthesesAroundIIFE: true,
        requireSpacesInConditionalExpression: true,
        // requireSpaceBeforeKeywords: true,
        requireSpaceAfterKeywords: [
          "if", "else",
          "switch", "case",
          "try", "catch",
          "do", "while", "for",
          "return", "typeof", "void",
        ],
        validateQuoteMarks: {
          mark: "\"",
          escape: true
        }
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

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-nodeunit");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-jsbeautifier");
  grunt.loadNpmTasks("grunt-jscs");

  grunt.registerTask("default", ["jshint", "jscs", "nodeunit"]);

  grunt.registerMultiTask("docs", "generate simple docs from examples", function() {
    // Concat specified files.
    var entries, readme;
    entries = JSON.parse(file.read(file.expand( this.data )));
    readme = [];

    entries.forEach(function( entry ) {

      var values, markdown, eg, md, png, fzz, title,
          hasPng, hasFzz, inMarkdown, filepath, fritzfile, fritzpath;

      if ( Array.isArray(entry) ) {
        // Produces:
        // "### Heading\n"
        readme.push( "\n### " + entry[0] + "\n" );

        // TODO: figure out a way to have tiered subheadings
        // readme.push(
        //   entry.reduce(function( prev, val, k ) {
        //     // Produces:
        //     // "### Board\n"
        //     return prev + (Array(k + 4).join("#")) + " " + val + "\n";
        //   }, "")
        // );
      }
      else {

        filepath = "eg/" + entry;

        eg = file.read( filepath );
        md = "docs/" + entry.replace(".js", ".md");
        png = "docs/breadboard/" + entry.replace(".js", ".png");
        fzz = "docs/breadboard/" + entry.replace(".js", ".fzz");
        title = entry;


        markdown = [];

        // Generate a title string from the file name
        [ [ /^.+\//, "" ],
          [ /\.js/, "" ],
          [ /\-/g, " " ]
        ].forEach(function( args ) {
          title = "".replace.apply( title, args );
        });

        fritzpath = fzz.split("/");
        fritzfile = fritzpath[ fritzpath.length - 1 ];
        inMarkdown = false;

        // Modify code in example to appear as it would if installed via npm
        eg = eg.replace("../lib/johnny-five.js", "johnny-five")
              .split("\n").filter(function( line ) {

          if ( /@markdown/.test(line) ) {
            inMarkdown = !inMarkdown;
            return false;
          }

          if ( inMarkdown ) {
            line = line.trim();
            if ( line ) {
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

        hasPng = fs.existsSync(png);
        hasFzz = fs.existsSync(fzz);

        // console.log( markdown );

        values = {
          title: _.titleize(title),
          command: "node " + filepath,
          example: eg,
          file: md,
          markdown: markdown.join("\n"),
          breadboard: hasPng ? templates.img({ png: png }) : "",
          fritzing: hasFzz ? templates.fritzing({ fzz: fzz }) : ""
        };

        // Write the file to /docs/*
        file.write( md, templates.doc(values) );

        // Push a rendered markdown link into the readme "index"
        readme.push( templates.doclink(values) );
      }
    });

    // Write the readme with doc link index
    file.write( "README.md", templates.readme({ doclinks: readme.join("") }) );

    log.writeln("Docs created.");
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
