# 2.15.0

* Remove scope dependency [#648](https://github.com/angular-ui-tree/angular-ui-tree/pull/648)

# 2.14.0

* Include the CSS source files in the build [#685](https://github.com/angular-ui-tree/angular-ui-tree/pull/685)
* Fix Callback Routing [#673](https://github.com/angular-ui-tree/angular-ui-tree/pull/673)
* Update to Node v4.2.4 [#696](https://github.com/angular-ui-tree/angular-ui-tree/pull/696)

# 2.13.0

* Bind keydown handler to document [#636](https://github.com/angular-ui-tree/angular-ui-tree/pull/636)
* Ability to change whether nodes should be collapsed or expanded by default [#643](https://github.com/angular-ui-tree/angular-ui-tree/pull/643)
* Drag & drop Protractor tests [#638](https://github.com/angular-ui-tree/angular-ui-tree/pull/638)
* Fix #680 (drag-drop not working if beforeDrop is not implemented) [#683](https://github.com/angular-ui-tree/angular-ui-tree/pull/683)

# 2.12.0

* Use this.sourceInfo.cloneModel instead [#627](https://github.com/angular-ui-tree/angular-ui-tree/issues/627)
* Add documentation for cloneModel [#660](https://github.com/angular-ui-tree/angular-ui-tree/issues/660)
* Fix accept() to check $treeScope.nodropEnabled [#665](https://github.com/angular-ui-tree/angular-ui-tree/issues/665)
* Add information about styling to the README file [#666](https://github.com/angular-ui-tree/angular-ui-tree/issues/666)
* [#507](https://github.com/angular-ui-tree/angular-ui-tree/issues/507) Promise support callbacks [#589](https://github.com/angular-ui-tree/angular-ui-tree/issues/589)

# 2.11.0

* Reset placeholder display attribute instead of changing it to block [#631](https://github.com/angular-ui-tree/angular-ui-tree/issues/631)
* Firefox issue where tree offset is wrong if scrolled horizontally [#626](https://github.com/angular-ui-tree/angular-ui-tree/issues/626)
* Fix `Cannot read property '$type' of undefined"` error / issue  [#674](https://github.com/angular-ui-tree/angular-ui-tree/issues/674)
* Remove line which sets the placeholder width explicitly  [#642](https://github.com/angular-ui-tree/angular-ui-tree/issues/642)
* Added a demo using a table [#656](https://github.com/angular-ui-tree/angular-ui-tree/issues/656)
* Fix drop placeholder for tables [#654](https://github.com/angular-ui-tree/angular-ui-tree/issues/654)
* Fix empty tree element for tables [#655](https://github.com/angular-ui-tree/angular-ui-tree/issues/655)
* Fix `Cannot read property 'childNodes' of undefined` [#650](https://github.com/angular-ui-tree/angular-ui-tree/issues/650)
* Remove duplicate license entry in package.json [#658](https://github.com/angular-ui-tree/angular-ui-tree/issues/658)

# 2.10.0

* Fix crashing $nodesScope.$modelValue.length watch [#574](https://github.com/angular-ui-tree/angular-ui-tree/issues/574)
* Fix out of depth calculation [#582](https://github.com/angular-ui-tree/angular-ui-tree/issues/582)
* Update default styling to work with tables [#572](https://github.com/angular-ui-tree/angular-ui-tree/issues/572)
* Call the dragStart callback after setting up the variables [#587](https://github.com/angular-ui-tree/angular-ui-tree/issues/587)
* Add Angular 1.4.x as dependency [#592](https://github.com/angular-ui-tree/angular-ui-tree/issues/592)
* Put drag element to the $rootElement instead of the body [#612](https://github.com/angular-ui-tree/angular-ui-tree/issues/612)
* Add support for Browserify/Webpack [#614](https://github.com/angular-ui-tree/angular-ui-tree/issues/614)

# 2.9.0

* Updated Bower package name to `angular-ui-tree` [#568](https://github.com/angular-ui-tree/angular-ui-tree/pull/568)
* Remove placeholder and cancel drop on drag out of bounds [#550](https://github.com/angular-ui-tree/angular-ui-tree/pull/550)
* Fix position detection on touch devices when using jQuery [#554](https://github.com/angular-ui-tree/angular-ui-tree/pull/554)

# 2.8.0

* Rename `$uiTreeHelper` service to `UiTreeHelper` [#534](https://github.com/angular-ui-tree/angular-ui-tree/pull/534)
* Nodrop, clone, and dirty-checking fixes [#525](https://github.com/angular-ui-tree/angular-ui-tree/pull/525)

# 2.7.0

* Fix edge case error when you have a single node with no parents and no children and and drop the node in the same place [#510](https://github.com/angular-ui-tree/angular-ui-tree/pull/510)
* Fix error in the `apply` function [#512](https://github.com/angular-ui-tree/angular-ui-tree/pull/512)
* Fix calculation of the placeholder width [#526](https://github.com/angular-ui-tree/angular-ui-tree/pull/526) [#470](https://github.com/angular-ui-tree/angular-ui-tree/pull/470)

# 2.6.0

* Use `data-nodrag` instead of `nodrag` attribute in the examples, as `$uiTreeHelper` service looks for the first one [#468](https://github.com/angular-ui-tree/angular-ui-tree/pull/468)
* Drag-dropping a node in the same position and container no longer removes and re-adds it to its parent node array [#485](https://github.com/angular-ui-tree/angular-ui-tree/pull/485)
* `bower.json` should reference only one copy of `angular-ui-tree.js` in main [#488](https://github.com/angular-ui-tree/angular-ui-tree/pull/488)

# 2.5.0

* Prevents child node scope with no children to be counted in depth [#388](https://github.com/angular-ui-tree/angular-ui-tree/pull/388)
* Fix callback errors when we have intermediate isolated scopes [#423](https://github.com/angular-ui-tree/angular-ui-tree/pull/423)
* Rename API attribute for toggling the empty placeholder [#450](https://github.com/angular-ui-tree/angular-ui-tree/pull/450)

# 2.4.0

* Added JSCS validation task [#441](https://github.com/angular-ui-tree/angular-ui-tree/pull/441)
* Bugfix `data-drag-delay` to actually delay `dragStart` [#444](https://github.com/angular-ui-tree/angular-ui-tree/pull/444)

# 2.3.0

* Add `data-clone-enabled` option + fix `data-drop-enabled` option ([#411](https://github.com/angular-ui-tree/angular-ui-tree/pull/411))
* Replaced Grunt with Gulp for the build process ([#435](https://github.com/angular-ui-tree/angular-ui-tree/pull/435))
* Fixed memory leak [#421](https://github.com/angular-ui-tree/angular-ui-tree/pull/421)

# 2.2.0

* release has been [reverted](https://github.com/angular-ui-tree/angular-ui-tree/commit/800dd0a43ce105d6301cd42038c1a28dbe3cd21e) to v2.1.5

# 2.1.5 (2014-07-31)

* latest release without CHANGELOG
