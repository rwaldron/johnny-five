var inspect = require("util").inspect,
    fs = require("fs");


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
        "test/board.js",
        "test/options.js",
        "test/pins.js",
        "test/capabilities.js",
        // ------------------
        "test/button.js",
        "test/distance.js",
        "test/lcd.js",
        "test/led.js",
        "test/pin.js",
        "test/ping.js",
        "test/pir.js",
        "test/sensor.js",
        "test/sonar.js",
        "test/switch.js",
        "test/shiftregister.js"
      ]
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        strict: false,
        globals: {
          exports: true,
          document: true,
          $: true,
          Radar: true,
          WeakMap: true,
          window: true
        }
      },
      files: {
        src: ["Gruntfile.js", "lib/**/!(johnny-five)*.js", "test/**/*.js", "eg/**/*.js"]
      }
    },

    jsbeautifier: {
      files: ["lib/**/*.js"],
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
    }
  });
  // Default tasks are contrib plugins
  grunt.loadNpmTasks("grunt-contrib-nodeunit");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-jsbeautifier");
  // Default task.
  grunt.registerTask("default", ["jshint", "nodeunit"]);

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
};
