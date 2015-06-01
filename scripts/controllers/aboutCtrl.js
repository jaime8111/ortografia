'use strict';

angular.module('meetcost')
    .controller('IntroCtrl', function ($rootScope) {

        $rootScope.pageInfo = {
            'id': 'aboutPage',
            'class': 'aboutPage',
            'title': 'Acerca de nosotros'
        };

        // hide fixed bar by default
        $rootScope.toggleBarVisibility = false;
    });

