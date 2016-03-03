Contribute to Johnny-Five!
=====================
Do you want to help out but don't know where to start?

### Guideline Contents

There are a lot of ways to get involved and help out:
- [Reporting an issue](#reporting-issues)
- [Requesting features](#requesting-features)
- [Requesting Support for new hardware](#hardware-support)
- [Submitting Pullrequests](#pullrequests)
- [Writing tests](#writing-tests)
- [Writing Documentation](#writing-docs)
- [Sample Projects](#sample-projects)

<a name="reporting-issues"></a>
## Reporting An Issue

Johnny-Five does it's [issue tracking](https://github.com/rwaldron/johnny-five/issues) through github. To report an issue first search the repo to make sure that it has not been reported before.  If no one has reported the bug before, create a new issue and be sure to include the following information:

**Board:** (e.g Arduino Uno, Intel Edison, etc)
**Shield:** (if you're using one, what kind)
**Hardware you are having an issue with:** (e.g. servos, leds, sensors, and what brand/type you are using)
**Version of Johnny-Five:**
**What your expectations are:**
**What the actual outcome is:**
**Steps to reproduce (including code samples):**

Lastly, if you are able, including a video is incredibly helpful in a lot of cases of debugging issues. You can upload videos to [youtube](https://www.youtube.com/), [vine](https://vine.co/), or any site that lets you host videos.

If the issue has been reported before but you have new information to help troubleshoot the issue, add a comment to the thread with the same information as requested above.


<a name="requesting-features"></a>
## Requesting Features

To request a new feature be added to one of the existing classes, create a [github issue](https://github.com/rwaldron/johnny-five/issues) and include:

**What feature you'd like to see:**
**Why this is important to you:** (this is here because it's interesting knowing what cool things people are working on and also could help community members make suggestions for work-arounds until the feature is built)



<a name="hardware-support"></a>
## Hardware Support

Often, people get a new cool toy and wonder "does Johnny-Five support this yet?"  When requesting support for new hardware remember that the team working on johnny-five might not own that hardware.

To submit a request to support new hardware, first create a [github issue](https://github.com/rwaldron/johnny-five/issues) and include a link to the specs of the hardware and where one can purchase it. Often, it might be suggested that you be the one to help implement the support yourself if you're already in possession of the product.

<a name="pullrequests"></a>
## Submitting Pull Requests

To contribute code to Johnny-Five, fork the project onto your github account and do your work in a branch. Before you submit the PR, make sure to rebase master into your branch so that you have the most recent changes and nothing breaks or conflicts.  Lint and test your code using [grunt](https://github.com/gruntjs/grunt). Also squash your commits to a reasonable size before submitting.

All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwaldron/idiomatic.js),
by maintaining the existing coding style.

If you are contributing code, it must include unit tests that fail if the working code isn't present and succeed when it is. Also make sure you run `grunt jsbeautifier` to fix any syntax issues.

When contributing new features that support new hardware, you must include documentation.  The docs need to have:

- [ ] fritzing diagram
- [ ] annotated example script in the eg/ folder
- [ ] api documentation in the wiki

It's very important that your pull requests include all of the above in order for users to be able to use your code. Pull requests with undocumented code will not be accepted.


<a name="writing-tests"></a>
## Writing Tests

Tests are written using [nodeunit](https://github.com/caolan/nodeunit) and [sinon](http://sinonjs.org/).  If you are having issues making a test pass, ask for help in the Johnny-Five [gitter](https://gitter.im/) room.  Tests can be the hardest part to write when contributing code, so don't be discouraged.

If you're interested in just writing tests to learn more about the project, check out the [tests](https://github.com/rwaldron/johnny-five/labels/Tests) label in the issues.

Tests that involve temporal elements (e.g. animations, tones/songs) can be troublesome on certain hardware and can cause failures for Travis CI builds. These tests can be put in `test/extended` to prevent them from breaking builds.

<a name="writing-docs"></a>
## Writing Documentation

We are always looking to improve our docs.  If you find that any are lacking information or have wrong information, fix and submit a PR.  If you're looking for areas to start writing docs for, see the [docs](https://github.com/rwaldron/johnny-five/labels/DOCS) label in issues.

Docs should have tested and working sample code, [fritzing diagrams](http://fritzing.org/), photos, and videos where applicable.  Many people using Johnny-Five are learning how to work with hardware for the first time, so write for a beginner audience.

The [wiki](https://github.com/rwaldron/johnny-five/wiki) contains documentation about the api, and contains code examples and fritzing diagrams.

The [eg folder](https://github.com/rwaldron/johnny-five/tree/master/eg) contains working code examples that users can run out of the box. Each of these example files has an associated .md file in the [docs folder](https://github.com/rwaldron/johnny-five/tree/master/docs) that is generated from the eg files. When contributing documentation updates for those code examples, modify the one in the [eg folder](https://github.com/rwaldron/johnny-five/tree/master/eg) and run `grunt examples` to regenerate its [docs folder](https://github.com/rwaldron/johnny-five/tree/master/docs) counterpart, then submit both of them as part of your contribution/PR. If you add a new documentation file, remember you will need to add it to `tpl/program.json` as well.


<a name="sample-projects"></a>
## Sample Projects

Have you made something cool with Johnny-Five? Let us know! There are a lot of people out there hacking on similar projects and looking for ideas, help or code. We'd like to create a directory of cool projects.
