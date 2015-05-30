'use strict';

angular.module('meetcost')
    .controller('MainCtrl', function ($scope, $cookies, $rootScope, $http) {


        // set page info
        $rootScope.pageInfo = {
            'id': 'indexPage',
            'class': 'indexPage',
            'title': 'Meeting time & cost'
        };

        $rootScope.settings = {
            'questionsAmount': 5,
            'setTimeLimit': false,
            'timeLimit': 10
        }

        // hide fixed bar by default
        $rootScope.toggleBarVisibility = false;

        // check localstorage support
        if(typeof(Storage)=="undefined") {
          alert("Sorry! No web storage support. You can not use this app.");
        }

        $scope.toggleBar = function () {
            if ( $rootScope.toggleBarVisibility ) {
                $rootScope.toggleBarVisibility = false;
            } else {
                $rootScope.toggleBarVisibility = true;
            }
        }

        loadData($rootScope, $http);


    });

function loadData (funcScope, http) {
    if ( !funcScope.data ) {
        http({
                method: 'GET',
                url: 'data/data.json',
                cache: true
            }).
            success(function(data) {

                funcScope.data = data;
                console.log("DATA LOADED");


                funcScope.loaded = true;
            }).
            error(function() {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
              $scope.online = false;
        });
    }

}