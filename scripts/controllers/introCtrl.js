'use strict';

angular.module('meetcost')
    .controller('AboutCtrl', function ($rootScope) {

        $rootScope.pageInfo = {
            'id': 'aboutPage',
            'class': 'aboutPage',
            'title': 'El juego de la ortografía'
        };

        // hide fixed bar by default
        $rootScope.toggleBarVisibility = false;
    });

