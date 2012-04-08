JSHint, A Static Code Analysis Tool for JavaScript
==================================================

JSHint is a community-driven tool to detect errors and potential problems in
JavaScript code and to enforce your team's coding conventions.

**IMPORTANT**:

 * This README is for people who are thinking about contributing to JSHint. For general usage
   please refer to [our website](http://jshint.com/).
 * If you want to report a bug about the website, please go to the
   [jshint/site](https://github.com/jshint/site/) repository.
 * If you want to report a bug or contribute to our NPM package, please go to the
   [jshint/node-jshint](https://github.com/jshint/node-jshint/) repository.

Reporting a bug
---------------

To report a bug simply create a [new GitHub Issue](https://github.com/jshint/jshint/issues/new) and
describe your problem or suggestion. We welcome all kind of feedback regarding JSHint including but
not limited to:

 * When JSHint doesn't work as expected
 * When JSHint complains about valid JavaScript code that works in all browsers
 * When you simply want a new option or feature

Please, before reporting a bug look around to see if there are any open or closed tickets that
cover your issue. And remember the wisdom: pull request > bug report > tweet.

Submitting patches
------------------

The best way to make sure your issue is addressed is to submit a patch. GitHub provides a very
nice interface--pull requests--for that but we accept patches through all mediums: email, issue
comment, tweet with a link to a snippet, etc.

Before submitting a patch make sure that you comply to our style. We don't have specific style
guide so just look around the code you are changing.

Also, make sure that you write tests for new features and make sure that all tests pass before
submitting a patch. Patches that break the build will be rejected.

**FEATURE FREEZE**: Please note that we currently have a feature freeze on new environments and
styling options. The only patches we accept at this time are for bug fixes.

Tests
-----

To run tests you will need to install [node.js](http://nodejs.org/) and
expresso. You can install the latter with npm:

    npm install expresso

After that, running the unit tests is as easy as:

    expresso tests/unit/*.js

Attribution
-----------

Core Team members:

 * [Anton Kovalyov](http://anton.kovalyov.net/) ([@valueof](http://twitter.com/valueof))
 * [Wolfgang Kluge](http://klugesoftware.de/) ([blog](http://gehirnwindung.de/))
 * [Josh Perez](http://www.goatslacker.com/) ([@goatslacker](http://twitter.com/goatslacker))

Maintainer: Anton Kovalyov

Thank you!
----------

We really appreciate all kind of feedback and contributions. Thanks for using and supporting JSHint!
