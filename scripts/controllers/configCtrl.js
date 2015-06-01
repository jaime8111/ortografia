'use strict';

angular.module('meetcost')
    .controller('ConfigCtrl', function ($rootScope) {

        $rootScope.pageInfo = {
            'id': 'configPage',
            'class': 'configPage',
            'title': 'Configuración'
        };

        // hide fixed bar by default
        $rootScope.toggleBarVisibility = false;

        $rootScope.$watch('questionsAmount', function() {
            console.log("watch", $rootScope.questionsAmount);
            localStorage.questionsAmount = $rootScope.questionsAmount;
        });


    });

