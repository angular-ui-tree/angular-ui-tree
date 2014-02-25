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

## Usage

Angularjs script

```js
var app = angular.module('nestedSortableDemoApp', [
	'ui.nestedSortable'
]);
```  
Injecting `ui.nestedSortable` to your App.

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

- Adding `ui-nested-sortable` to your root element.
- Using `ng-model` to bind the list data with element. It should be an array.
- Adding `ui-nested-sortable-item` to your item element, it always follow the `ng-repeat` attribute.
- Adding `ui-nested-sortable-handle` to mark which element do you want to handle the drage action
- All `ui-nested-sortable`, `ng-model`, `ui-nested-sortable-item` and `ui-nested-sortable-handle` are necessary. And they can be nested.
- If you add a `data-nodrag` attribute to an element, the element won't response for the drag action.

## ngmodules

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
