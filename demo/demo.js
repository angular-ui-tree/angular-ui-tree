var app = angular.module('nestedSortableDemoApp', [
	'ui.nestedSortable'
]);

app.controller('sample1Ctrl', function ($scope) {
	
	var list = [
		{
			"id": 1,
			"title": "item1",
			"items": [],
		},
		{
			"id": 2,
			"title": "item2",
			"items": [
				{
					"id": 21,
					"title": "item2.1",
					"items": [],
				},
				{
					"id": 22,
					"title": "item2.2",
					"items": [],
				}
			],
		},
		{
			"id": 3,
			"title": "item3",
			"items": [
				{
					"id": 31,
					"title": "item3.1",
					"items": [],
				},
				{
					"id": 32,
					"title": "item3.2",
					"items": [],
				},
				{
					"id": 33,
					"title": "item3.3",
					"items": [],
				}
			],
		},
		{
			"id": 4,
			"title": "item4",
			"items": [],
		}
	];

	$scope.list = list;

});

app.controller('sample2Ctrl', function ($scope) {
	
	var chapters = [
		{
			"id": 1,
			"type": "chapter",
			"title": "chapter 1",
			"lectures": [],
		},
		{
			"id": 2,
			"title": "chapter 2",
			"type": "chapter",
			"lectures": [
				{
					"id": 21,
					"type": "lecture",
					"title": "lecture 2.1",
				},
				{
					"id": 22,
					"type": "lecture",
					"title": "lecture 2.2",
				}
			],
		},
		{
			"id": 3,
			"title": "chapter 3",
			"type": "chapter",
			"lectures": [
				{
					"id": 31,
					"type": "lecture",
					"title": "lecture 3.1",
				},
				{
					"id": 32,
					"type": "lecture",
					"title": "lecture 3.2",
				},
				{
					"id": 33,
					"type": "lecture",
					"title": "lecture 3.3",
				}
			],
		},
		{
			"id": 4,
			"title": "chapter 4",
			"type": "chapter",
			"lectures": [],
		}
	];

	$scope.info = "";
	$scope.chapters = chapters;

	$scope.chaptersOptions = {
		accept: function(data) {
			return (data.type == 'chapter'); // only accept chapter
		},
		orderChanged: function(scope, sourceItem, sourceIndex, destIndex) {
			$scope.info = "Chapter [" + sourceItem.title + "] changed order from " + sourceIndex + " to " + destIndex;
			$scope.$apply();
		},
		
	};
	$scope.lecturesOptions = {
		accept: function(data) {
			return (data.type == 'lecture'); // only accept lecture
		},
		orderChanged: function(scope, sourceItem, sourceIndex, destIndex) {
			$scope.info = "Lecture [" + sourceItem.title + "] changed order from " + sourceIndex + " to " + destIndex;
			$scope.$apply();
		},
		itemRemoved: function(scope, sourceItem, sourceIndex) {
			$scope.info = "Chapter [" + scope.chapter.title + "] removed a lecture [" + sourceItem.title + "] from " + sourceIndex + ".";
		},
		itemAdded: function(scope, sourceItem, destIndex) {
			$scope.info += "\r\nChapter [" + scope.chapter.title + "] added a lecture [" + sourceItem.title + "] to " + destIndex;
			$scope.$apply();
		},
	};

});