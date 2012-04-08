# {%= title || name %}

{%= description %}

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/{%= git_user %}/{%= name %}/master/dist/{%= name %}.min.js
[max]: https://raw.github.com/{%= git_user %}/{%= name %}/master/dist/{%= name %}.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/{%= name %}.min.js"></script>
<script>
jQuery(function($) {
  $.awesome(); // "awesome"
});
</script>
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

_Also, please don't edit files in the "dist" subdirectory as they are generated via grunt. You'll find source code in the "src" subdirectory!_

## Release History
_(Nothing yet)_

## License
Copyright (c) {%= grunt.template.today('yyyy') %} {%= author_name %}  
Licensed under the {%= licenses.join(', ') %} license{%= licenses.length === 1 ? '' : 's' %}.
