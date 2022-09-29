const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const ct = require("common-tags");

process.env.IS_TEST_MODE = true;

module.exports = function(grunt) {

  const task = grunt.task;
  const file = grunt.file;
  const log = grunt.log;
  const fail = grunt.fail;
  const verbose = grunt.verbose;
  const _ = grunt.util._;

  const templates = {
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

  const noedit = file.read("tpl/.noedit.md");
  const programsJson = JSON.parse(file.read("tpl/programs.json"));
  const programsList = programsJson.reduce((paccum, topics) => paccum.concat(
    topics.examples.reduce((faccum, example) => faccum.concat([`eg/${example.file}`]), [])
  ), []);


  let changedFiles = [];

  if (Number(process.versions.node.split(".")[0]) >= 4) {
    changedFiles = cp.execSync("git diff --name-only").toString().split("\n").reduce((accum, line) => {
      const value = line.trim();
      if (value && value.endsWith(".js")) {
        accum.push(value);
      }
      return accum;
    }, []);
  }

  let primaryFiles = [
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
        "test/common/bootstrap.js",
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

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-nodeunit");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-jsbeautifier");
  grunt.loadNpmTasks("grunt-jscs");

  // grunt.registerTask("beautify", ["jsbeautifier"]);

  grunt.registerTask("default", ["jshint", "jscs", "nodeunit"]);
  grunt.registerTask("test", ["jshint", "jscs", "nodeunit:complete"]);

  grunt.registerTask("example", "Create an example program, usage: 'grunt expample:<file-name>[.js]'", fileName => {

    if (!fileName.endsWith(".js")) {
      fileName += ".js";
    }

    const pathAndFile = `eg/${fileName}`;

    if (file.exists(pathAndFile)) {
      fail.warn(`${pathAndFile} exists!`);
    } else {
      file.write(pathAndFile, templates.program());
      log.writeln("Example created: %s", pathAndFile);
    }
  });

  function expandRulesToFiles(rPath, input) {
    if (!input.endsWith(".js")) {
      if (!input.endsWith("*") || !input.endsWith("**/*")) {
        input = ["{", path.normalize(`${input}*`), ",", path.normalize(`${input}**/*`), "}"].join("");
      }
    }
    return rPath + input;
  }

  grunt.registerTask("nodeunit:file", "Run a subset of tests by specifying a file name or glob expression. Usage: 'grunt nodeunit:file:<file.ext>' or 'grunt nodeunit:file:<expr>'", input => {

    const config = [
      "test/common/bootstrap.js",
    ];

    if (input) {
      config.push(expandRulesToFiles("test/", input));
      grunt.config("nodeunit.tests", config);
    }

    grunt.task.run("nodeunit");
  });


  grunt.registerTask("nodeunit:files", "Run a subset of tests by specifying a file name, bracket list of file names, or glob expression. Usage: 'grunt nodeunit:file:<file.ext>' or 'grunt nodeunit:file:<expr>'", files => {
    grunt.task.run(`nodeunit:file:${files}`);
  });

  grunt.registerTask("qc", "Run JSHint & JSCS checks on a file or files by specifying a file name or glob expression. Usage: 'grunt qc' or 'grunt qc:<file.ext>' or 'grunt qc:<expr>'", input => {

    if (input) {
      primaryFiles.length = 0;

      file.expand(input).forEach(file => {
        primaryFiles.push(file);
      });
    }

    grunt.task.run("jshint");
    grunt.task.run("jscs");
  });

  grunt.registerTask("qc:examples", "Run JSHint checks on the examples in 'eg/'", () => {
    grunt.task.run("qc:eg/**/*.js");
  });

  grunt.registerTask("beautify", "Cleanup a single or limited set of files; usage: 'grunt beautify:file.js' or 'grunt beautify:{file-a.js,file-b.js}' (extension optional)", input => {

    const config = [];

    if (input) {
      config.push(expandRulesToFiles("", input));
      grunt.config("jsbeautifier.files", config);
    }

    grunt.task.run("jsbeautifier");
  });

  // Support running a complete set of tests with
  // extended (possibly-slow) tests included.
  grunt.registerTask("nodeunit:complete", () => {
    console.log("\nDid you mean? 'grunt nodeunit:extended' ?");
  });

  grunt.registerTask("nodeunit:extended", () => {
    grunt.config("nodeunit.tests", [
      "test/extended/animation.js",
      "test/extended/led.js",
      "test/extended/piezo.js",
      "test/extended/servo.js",
    ]);

    grunt.task.run("nodeunit");
  });

  grunt.registerMultiTask("examples", "Generate examples", function() {
    // Concat specified files.
    const entries = JSON.parse(file.read(file.expand(this.data)));
    const readme = [];

    let auto = true;

    entries.forEach(entry => {
      const topic = entry.topic;

      log.writeln(`Processing examples for: ${entry.topic}`);

      readme.push(`\n### ${topic}\n`);

      entry.examples.sort((a, b) => {
        if (a.title < b.title) {
          return -1;
        }
        if (a.title > b.title) {
          return 1;
        }
        return 0;
      }).forEach(egRecord => {
        let markdown = [];
        let filepath = `eg/${egRecord.file}`;

        if ( !egRecord.file || !fs.existsSync(path.join(process.cwd(), filepath)) ) {
          grunt.fail.fatal(`Specified example file doesn't exist: ${filepath}`);
        }

        let example = file.read(filepath);
        let name = (egRecord.name || egRecord.file).replace(".js", "");

        let md = `docs/${name}.md`;
        let inMarkdown = false;

        if (!egRecord.title) {
          egRecord.title = null;
        }

        // Modify code in example to appear as it would if installed via npm
        example = example.replace(/\.\.\/lib\/|\.js/g, "").split("\n").filter(line => {
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
        let images = egRecord.images || [];
        let title = `Breadboard for "${egRecord.title}"`;

        // Get list of breadboards diagrams to include (Default: same as file name)
        let breadboards = egRecord.breadboards || [{
          auto,
          name,
          title,
        }];

        let embeds = (egRecord.embeds || []).map(embed => templates.embeds[embed.type]({ src: embed.src }));

        // We'll combine markdown for images and breadboards
        let imgMarkdown = "";

        let primary = breadboards.shift();

        images.forEach(img => {
          if (!img.title || !img.file) {
            grunt.fail.fatal("Invalid image: title and file required");
          }

          img.filepath = `docs/images/${img.file}`;
          const hasImg = fs.existsSync(path.join(process.cwd(), img.filepath));
          if (hasImg) {
            imgMarkdown += templates.img({ img });
          } else {
            // If it's specified but doesn't exist, we'll consider it an error
            grunt.fail.fatal(`Invalid image: ${img.file}`);
          }
        });

        breadboards.forEach(breadboard => {
          imgMarkdown += breadboardMarkdown(breadboard);
        });

        let alternates = [];

        if (egRecord.alternates) {
          alternates = egRecord.alternates.map(alternate => ({
            description: alternate.description || "",
            source: file.read(`eg/${alternate.file}`).replace("../", "johnny-five"),
            title: alternate.title || ""
          }));
        }

        primary = primary ? breadboardMarkdown(primary) : "";

        let values = {
          command: `node ${filepath}`,
          description: egRecord.description,
          embeds,
          example,
          alternates,
          externals: egRecord.externals || [],
          file: md,
          images: imgMarkdown,
          markdown,
          primary,
          title: egRecord.title,
          theYear: (new Date()).getUTCFullYear()
        };

        // Write the file to /docs/*
        file.write(md, templates.eg(values));

        // Push a rendered markdown link into the readme "index"
        readme.push(templates.eglink(values));
      });
    });

    let egcount = readme.length;
    let eglinks = readme.join("");

    // Write the readme with doc link index
    file.write("README.md",
      templates.readme({
        noedit,
        egcount,
        eglinks,
      })
    );

    log.writeln("Examples created.");
  });


  function breadboardMarkdown(breadboard) {
    if (!breadboard.name) {
      grunt.fail.fatal("Invalid breadboard: name required");
    }

    breadboard.png = `docs/breadboard/${breadboard.name}.png`;
    breadboard.fzz = `docs/breadboard/${breadboard.name}.fzz`;

    breadboard.hasPng = fs.existsSync(path.join(process.cwd(), breadboard.png));
    breadboard.hasFzz = fs.existsSync(path.join(process.cwd(), breadboard.fzz));

    if (!breadboard.hasPng) {
      if (breadboard.auto) {
        // i.e. we tried to guess at a name but still doesn't exist
        // We can just ignore and no breadboard shown
        return;
      } else {
        // A breadboard was specified but doesn't exist - error
        grunt.fail.fatal(`Specified breadboard doesn't exist: ${breadboard.png}`);
      }
    }

    // FZZ is optional, but we'll warn at verbose
    if (!breadboard.hasFzz) {
      verbose.writeln(`Missing FZZ: ${breadboard.fzz}`);
    }

    return templates.breadboard({ breadboard });
  }

  // run the examples task and fail if there are uncommitted changes to the docs directory
  task.registerTask("test-examples", "Guard against out of date examples", ["examples", "fail-if-uncommitted-examples"]);

  task.registerTask("fail-if-uncommitted-examples", () => {
    const done = task.current.async();

    task.requires("examples");

    cp.exec("git diff --exit-code --name-status ./docs", (error, result) => {
      if (error) {
        grunt.fail.fatal(
          ct.stripIndents`
            The generated examples don't match the committed examples.
            Please ensure you've run 'grunt examples' before committing.

            ${result}
          `
        );
      }
      done();
    });
  });
};
