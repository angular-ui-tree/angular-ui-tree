# Contributing Guidelines

First of all, thank you for considering to contribute to the UI Tree project.
The community is important to us and we appreciate your time and effort to help pushing towards a better generic tree component.

## Submitting a PR

As an attempt to make the process of contributing more pleasant for you and the reviewers, we've created a checklist.
Please make sure your PR confirms to critera listed below.

- Use a descriptive title using proper grammar (this is important because the same text will be used for the changelog)
- Make sure the build passes
- Do not include files from the `dist/` directory (These are created when a new release is made. Adding them to every PR will result in merge conflicts for other PR's.)

## Accepting a PR

1. Manually review PR in the 'Files Changed' tab of the GitHub PR section
2. Ensure Travis build passing
3. Review Coveralls and Codacy reports.  
A fail does not necessarily mean a PR should be rejected, but it is a red flag that you should take a close look at the report.
4. Merge the PR. If the PR is simple and good as-is you can merge it using GitHub's web UI. If the PR needs some amending, or you want to test the changes, perform a command line merge (the 'commandline instructions' link gives the commands).
5. Test the PR locally and run the tests (gulp test and gulp test:e2e)
6. Make any additional changes you need (update README, update example site, etc)
7. Push the changes

## Creating a release

1. Run the tests (`$ npm test`)
3. Update CHANGELOG.md with release notes for the changes in the this release
4. Update version string in `source/main.js` and `package.json` and `bower.json`
5. Run `$ gulp build` and commit, this time including the new dist files.
6. Tag the commit as a new release (like v2.18.0)
7. Push all the changes including tags (eg. `$ git push --tags`)
8. Publish to npm with `$ npm publish ./`
9. Add a new [Release in GitHub](https://github.com/angular-ui-tree/angular-ui-tree/releases)
10. Update the website by running `$ gulp website` (runs the ghpages plugin)
11. Announce the release on [Gitter](https://gitter.im/angular-ui-tree/angular-ui-tree)

Our intention is to keep working on this document. Happy coding!
