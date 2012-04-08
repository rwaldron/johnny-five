[Grunt homepage](https://github.com/cowboy/grunt) | [Documentation table of contents](toc.md)

# Helpers and Directives

## Built-in Helpers
EXPLAIN

Take a look at the [built-in tasks source code](../tasks) for more examples.

## Built-in Directives

* `<config:prop.subprop>` - expand to the `prop.subprop` config property. This can be any number of objects deep, `prop.subprop.otherprop.whatever` is totally valid. Great for DRYing up file lists.
* `<json:file.json>` - expand to the object parsed from file.json via [grunt.file.parseJSON](api_file.md).
* `<banner>` - the string in config property `meta.banner`, parsed via [grunt.template.process](api_template.md), using `<% %>` delimiters.
* `<banner:prop.subprop>` - same as above, but using a custom config property.
* `<file_strip_banner:file.js>` - expand to the given file, with any leading `/*...*/` banner stripped.

Take a look at the [api documentation](api.md) and [example gruntfiles](example_gruntfiles.md) for directive creation and usage examples.
