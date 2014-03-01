Angular UI NestedSortable
======================

[![Build Status](https://travis-ci.org/JimLiu/Angular-NestedSortable.png?branch=master)](https://travis-ci.org/JimLiu/Angular-NestedSortable)

Angular NestedSortable is an AngularJS UI component that can sort nested lists, provides drag & drop support and doesn't depend on jQuery.

## Features

- Uses the native AngularJS scope for data binding
- Sorted and move items through the entire tree
- Prevent elements from accepting child nodes

## Supported browsers

The Angular NestedSortable is tested with the following browsers:

- Chrome (stable)
- Firefox
- IE 8, 9 and 10

For IE8 support, make sure you do the following:

- include an [ES5 shim](https://github.com/es-shims/es5-shim)
- make your [AngularJS application compatible with Internet Explorer](http://docs.angularjs.org/guide/ie)
- use [jQuery 1.x](http://jquery.com/browser-support/)

## Demo
Watch the NestedSortable component in action on the [demo page](http://jimliu.github.io/Angular-NestedSortable/).

## Requirements

- Angularjs

## Usage

Load the script file: `angular-nested-sortable.js` in your application:

```html
<script type="text/javascript" src="bower_components/angular-nested-sortable/angular-nested-sortable.js"></script>
```

Add the sortable module as a dependency to your application module:

```js
var myAppModule = angular.module('MyApp', ['ui.nestedSortable'])
```

Injecting `ui.nestedSortable`, `ui-nested-sortable-item` and `ui-nested-sortable-handle` to your html.

HTML View or Templates
```html
<ol ui-nested-sortable="" ng-model="list">
  <li ng-repeat="item in list" ui-nested-sortable-item="">
    <div ui-nested-sortable-handle>
      {{item.title}}
    </div>
    <ol ui-nested-sortable="" ng-model="item.items">
      <li ng-repeat="subItem in item.items" ui-nested-sortable-item="">
        <div ui-nested-sortable-handle>
          {{subItem.title}}
        </div>
      </li>
    </ol>
  </li>      
</ol> 
```  
**Developing Notes:**
- Using `ng-model` to bind the list data with element. It should be an array and it's required.
- Adding `ui-nested-sortable` to your root element.
- Adding `ui-nested-sortable-item` to your item element, it always follow the `ng-repeat` attribute.
- Adding `ui-nested-sortable-handle` to mark which element do you want to handle the drage action
- All `ui-nested-sortable`, `ng-model`, `ui-nested-sortable-item` and `ui-nested-sortable-handle` are necessary. And they can be nested.
- If you add a `data-nodrag` attribute to an element, the element won't response for the drag action.
- If you changed the datasource bound, sometimes you have to call [`$scope.$apply()`](http://docs.angularjs.org/api/ng/type/$rootScope.Scope#$apply) to refresh the view, otherwise you will get an error `Cannot read property '0' of undefined` ([Issue #32](https://github.com/JimLiu/Angular-NestedSortable/issues/32)).


### Callbacks

The Callbacks can be passed through the directive.

```js
myAppModule.controller('MyController', function($scope) {
  $scope.items = [...];
  $scope.sortableOptions = {
    accept: function(modelData, sourceItemScope, targetScope, destIndex) {
      return true;
    },
    itemRemoved: function(scope, modelData, sourceIndex) {

    },
    itemAdded: function(scope, modelData, destIndex) {

    },
    itemMoved: function(sourceScope, modelData, sourceIndex, destScope, destIndex) {

    },
    orderChanged: function(scope, modelData, sourceIndex, destIndex) {

    },
    itemClicked: function(modelData) {
      
    };
  };
});
```

```html
<ol ui-nested-sortable="sortableOptions" ng-model="items">
  <li ng-repeat="item in items" ui-nested-sortable-item="">
    <div ui-nested-sortable-handle>
      {{item.title}}
    </div>
  </li>      
</ol> 
```

- `accept` callback: Check if the dragging item can be dropped to current item. `return true` means it can be dropped here. `return false` means it cann't.
- `itemRemoved` callback: When a sub-item is removed.
- `itemAdded` callback: When a sub-item is added.
- `itemMoved` callback: When a sub-item is moved from a node to another node.
- `orderChanged` callback: Is only fired if the dragged item gets dropped at the same parent node.
- `itemClicked` callback: When an item is clicked.

#### Parameters
- `scope`, `sourceScope` or `sourceItemScope` is the `scope` object of the dragging item
- `targetScope` is the `scope` object which the dragging item is dragging over.
- `modelData` is the data bint with the dragging item
- `destScope` is the `scope` object which the dragged item dropped.
- `sourceIndex` is the index of item before it dragged.
- `destIndex` is the index of item after it dropped.

### Scope of Sortable
The `scope` of a `ui-nested-sortable` element.

#### Properties
##### sortableModelValue
**DataType**: `Array` 
The data bound with current scope.

#### Methods
##### parentItemScope()
if a `ui-nested-sortable` element belongs to another `ui-nested-sortable-item` element, using `parentItemScope()` to get the scope of it's parent item.
##### level()
Calculate it's level in the tree. The level of a root element is 1.

### Scope of Item
The `scope` of a `ui-nested-sortable-item` element.

#### Properties
##### collapsed
**DataType**: `Bool` 
`true`: Current item is collapsed; 
`false`: Current item is expanded.

#### Methods
##### itemData()
Get the model data which bind with the scope.
##### maxSubLevels()
Get the max level of all the sub-items of the scope. If there is no sub-items, return 0.
##### parentScope()
Get the scope of the parent `ui-nested-sortable` element.
##### subScope()
Get the scope of the child `ui-nested-sortable` element.

## NgModules Link

[Give us a like on ngmodules](http://ngmodules.org/modules/Angular-NestedSortable)

## Development environment setup
#### Prerequisites

* [Node Package Manager](https://npmjs.org/) (NPM)
* [Git](http://git-scm.com/)

#### Dependencies

* [Grunt](http://gruntjs.com/) (task automation)
* [Bower](http://bower.io/) (package management)

#### Installation
Run the commands below in the project root directory.

#####1. Install Grunt and Bower

    $ sudo npm install -g grunt-cli bower
    
#####2. Install project dependencies

    $ npm install
    $ bower install

## Useful commands

####Running a Local Development Web Server
To debug code and run end-to-end tests, it is often useful to have a local HTTP server. For this purpose, we have made available a local web server based on Node.js.

To start the web server, run:

    $ grunt webserver

To access the local server, enter the following URL into your web browser:

    http://localhost:8080/demo/

By default, it serves the contents of the demo project.


####Building NestedSortable
To build NestedSortable, you use the following command.

    $ grunt build

This will generate non-minified and minified JavaScript files in the `dist` directory.

####Run tests
You can run the tests once or continuous.

    $ grunt test
    $ grunt test:continuous
