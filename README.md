UINestedSortable Component for Angular UI
======================

An Angularjs ui component that can sort nested lists.


## Features

- Items can be sorted in their own list, moved across the tree, or nested under other items.
- It is possible to define elements that will not accept a new item/list
- Data binding. If you change the order, the data you bound will be updated.

## Usage

Angularjs script

```Javscript
var app = angular.module('nestedSortableDemoApp', [
	'ui.nestedSortable'
]);
```  
Injecting `ui.nestedSortable` to your App.



HTML View or Templates
```
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
- Using `ng-model` to bind the list data with element.
- Adding `ui-nested-sortable-item` to your item element, it always follow the `ng-repeat` attribute.
- Adding `ui-nested-sortable-handle` to mark which element do you want to handle the drage action
- All `ui-nested-sortable`, `ng-model`, `ui-nested-sortable-item` and `ui-nested-sortable-handle` are necessary. And they can be nested.



