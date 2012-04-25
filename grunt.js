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
        template = _.template( file.read("docs/.template.md") ),
        readme = "";

    files.forEach(function( filepath ) {
      var eg = file.read( filepath ),
          md = filepath.replace("eg", "docs").replace(".js", ".md"),
          title = filepath;

      [ [ /^.+\//, "" ],
        [ /\.js/, "" ],
        [ /\-/, " " ]
      ].forEach(function( args ) {
        title = "".replace.apply( title, args );
      });

      file.write( md, template({
          title: _.titleize(title),
          example: eg
        })
      );

      readme += _.template(
        "- [<%= title %>](https://github.com/rwldrn/johnny-five/blob/master/<%= file %>)",
        {
          title: _.titleize(title),
          file: filepath
        }
      );
    });

    console.log( readme );

    log.writeln("Docs created.");
  });
};
