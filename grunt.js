var inspect = require("util").inspect;


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
      files: ["test/**/*.js"]
    },
    lint: {
      files: ["grunt.js", "lib/**/*.js", "test/**/*.js", "eg/**/*.js"]
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
        node: true
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
          title = filepath;

      // Generate a title string from the file name
      [ [ /^.+\//, "" ],
        [ /\.js/, "" ],
        [ /\-/g, " " ]
      ].forEach(function( args ) {
        title = "".replace.apply( title, args );
      });

      // Modify code in example to appear as it would if installed via npm
      eg.replace("../lib/johnny-five.js", "johnny-five");

      values = {
        title: _.titleize(title),
        example: eg,
        file: md
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
