var app = angular.module('nestedSortableDemoApp', [
	'ui.nestedSortable'
]);

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
				"items": [
					{
						"id": 211,
						"title": "item2.1.1",
						"items": []
					},
					{
						"id": 212,
						"title": "item2.1.2",
						"items": []
					},
					{
						"id": 213,
						"title": "item2.1.3",
						"items": []
					}
				],
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
				"items": [
					{
						"id": 331,
						"title": "item3.3.1",
						"items": []
					},
					{
						"id": 332,
						"title": "item3.3.2",
						"items": []
					},
					{
						"id": 333,
						"title": "item3.3.3",
						"items": []
					}
				],
			}
		],
	},
	{
		"id": 4,
		"title": "item4",
		"items": [],
	}
];

/*
list = [
	{
		"id": 1,
		"title": "item1",
		"items": [
			{
				"id": 11,
				"title": "item1.1",
				"items": [],
			},
			{
				"id": 12,
				"title": "item1.2",
				"items": [],
			},
		],
	},
	{
		"id": 2,
		"title": "item2",
		"items": [],
	}
];	
*/

app.controller('sample1Ctrl', function ($scope) {
	$scope.list = list;
});

app.controller('sample3Ctrl', function ($scope) {
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
		accept: function(data, scope) {
			return (data.type == 'lecture'); // only accept lecture
		},
		orderChanged: function(scope, sourceItem, sourceIndex, destIndex) {
			$scope.info = "Lecture [" + sourceItem.title + "] changed order from " + sourceIndex + " to " + destIndex;
			$scope.$apply();
		},
		itemRemoved: function(scope, sourceItem, sourceIndex) {
			var info = "Chapter [" + scope.chapter.title + "] removed a lecture [" + sourceItem.title + "] from " + sourceIndex + ".";
			console.log(info);
		},
		itemAdded: function(scope, sourceItem, destIndex) {
			var info = "Chapter [" + scope.chapter.title + "] added a lecture [" + sourceItem.title + "] to " + destIndex;
			console.log(info);
		},
		itemMoved: function(sourceScope, sourceItem, sourceIndex, destScope, destIndex) {
			$scope.info = "Lecture [" + sourceItem.title + "] moved from [" + sourceScope.chapter.title + "][" + sourceIndex + "] to [" + destScope.chapter.title + "][" + destIndex + "]";
			$scope.$apply();
		},
	};

});