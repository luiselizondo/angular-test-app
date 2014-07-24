
// Blog app
var app = angular.module("App", ["ngResource", "ngRoute", "ngSanitize", "ui.bootstrap"]);

app.baseUrl = "http://localhost:3000";

function router($routeProvider) {
	$routeProvider.
		when("/", {
			controller: "ListItems", // string
			templateUrl: "list.html" // string
		}).
		when("/view/:id", {
			controller: "ViewItem",
			templateUrl: "view.html"
		}).
		when("/about", {
			templateUrl: "about.html" // controller is not needed
		}).
		otherwise({
			redirectTo: "/"
		});
}

app.config(router);

app.directive('markdown', function($window) {
  var converter = new $window.Showdown.converter();
  return {
    restrict: 'E',
    link: function(scope, element, attrs) {
      var htmlText = converter.makeHtml(element.text());
      element.html(htmlText);
    }
  }
});

app.factory("Items", ["$resource", function($resource) {
	var Resource = $resource(app.baseUrl + "/items/:id", {
		callback: "JSON_CALLBACK"
	}, {
		index: {method: "JSONP", isArray: true},
		get: {method: "JSONP", isArray: false}
	});

	return Resource;
}]);

/** 
 * Control the active class 
 */
app.controller("MenuController", function($scope, $location) {
	$scope.isActive = function(route) {
		return route === $location.path();
	}
});

app.controller("ListItems", function($scope, $modal, $log, Items) {
	Items.index(function(data) {
		$scope.items = data;
	});
});

app.controller("ModalController", function($scope, $modal, $log, Items) {
  $scope.openModal = function (selected) {
	  Items.get({id: selected}, function(data) {
			$scope.item = data;

	    var modalInstance = $modal.open({
	      templateUrl: 'modal',
	      controller: "ModalInstanceController",
	      size: "lg",
	      resolve: {
	        item: function () {
	          return $scope.item;
	        }
	      }
	    });

	    modalInstance.result.then(function (selectedItem) {
	      $scope.selected = selectedItem;
	    }, function () {
	      $log.info('Modal dismissed at: ' + new Date());
	    });

		});
  };
});

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
app.controller("ModalInstanceController", function($scope, $modalInstance, item) {
	var converter = new Showdown.converter();
	$scope.item = {};
	$scope.item.title = item.title;
	
	var htmlText = converter.makeHtml(item.body);
	$scope.item.body = htmlText;

  $scope.ok = function () {
    $modalInstance.close($scope.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});

app.controller("ViewItem", function($scope, $routeParams, Items) {
	var converter = new Showdown.converter();
	Items.get({id: $routeParams.id}, function(data) {
		$scope.item = {};
		$scope.item.title = data.title;
		
		var htmlText = converter.makeHtml(data.body);
		$scope.item.body = htmlText;
	})
});