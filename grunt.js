var inspect = require("util").inspect,
    path = require("path");


module.exports = function(grunt) {

  var task = grunt.task;
  var file = grunt.file;
  var utils = grunt.utils;
  var log = grunt.log;
  var verbose = grunt.verbose;
  var fail = grunt.fail;
  var option = grunt.option;
  var config = grunt.config;
  var template = grunt.template;
  var _ = utils._;

  var templates = {
    doc: _.template( file.read("tpl/.docs.md") ),
    img: _.template( file.read("tpl/.img.md") ),
    fritzing: _.template( file.read("tpl/.fritzing.md") ),
    doclink: _.template( file.read("tpl/.readme.doclink.md") ),
    readme: _.template( file.read("tpl/.readme.md") )
  };


  // Project configuration.
  grunt.initConfig({
    pkg: "<json:package.json>",

    docs: {
      files: ["eg/**/*.js"]
    },
    test: {
      files: ["test/board.js"]
    },
    lint: {
      files: ["grunt.js", "lib/!(johnny-five)**/*.js", "test/**/*.js", "eg/**/*.js"]
    },
    watch: {
      files: "<config:lint.files>",
      tasks: "default"
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
        es5: true
      },
      globals: {
        exports: true
      }
    }
  });

  // Default task.
  grunt.registerTask("default", "lint test");

  grunt.registerMultiTask("docs", "generate simple docs from examples", function() {
    // Concat specified files.
    var files = file.expandFiles( this.file.src ),
        readme = [];

    files.forEach(function( filepath ) {
      var values,
          eg = file.read( filepath ),
          md = filepath.replace("eg", "docs").replace(".js", ".md"),
          png = filepath.replace("eg", "docs/breadboard").replace(".js", ".png"),
          fritz = filepath.replace("eg", "docs/breadboard").replace(".js", ".fzz"),
          title = filepath,
          fritzfile, fritzpath;

      // Generate a title string from the file name
      [ [ /^.+\//, "" ],
        [ /\.js/, "" ],
        [ /\-/g, " " ]
      ].forEach(function( args ) {
        title = "".replace.apply( title, args );
      });

      fritzpath = fritz.split("/");
      fritzfile = fritzpath[ fritzpath.length - 1 ];

      // Modify code in example to appear as it would if installed via npm
      eg = eg.replace("../lib/johnny-five.js", "johnny-five");

      values = {
        title: _.titleize(title),
        example: eg,
        file: md,
        breadboard: path.existsSync(png) ? templates.img({ png: png }) : "",
        fritzing: path.existsSync(png) ? templates.fritzing({ fritzfile: fritzfile, fritz: fritz }) : ""
      };

      // Write the file to /docs/*
      file.write( md, templates.doc(values) );

      // Push a rendered markdown link into the readme "index"
      readme.push( templates.doclink(values) );
    });

    // Write the readme with doc link index
    file.write( "README.md", templates.readme({ doclinks: readme.join("") }) );

    log.writeln("Docs created.");
  });
};
