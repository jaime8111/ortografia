'use strict';

angular.module('meetcost')
    .controller('CreateCtrl', function ($scope, $http, $location, $rootScope, $window) {
        loadData($rootScope, $http);
        // set page info
        $rootScope.pageInfo = {
            'id': 'createPage',
            'class': 'createPage',
            'title': 'Selecciona el tipo'
        };

        $rootScope.$watch('loaded', function() {
            console.log("watch", $rootScope.loaded);
            if ($rootScope.loaded) {
                $scope.rules = $rootScope.data.rules;
                console.log($scope.rules );
            }
        });



        // hide fixed bar by default
        $rootScope.toggleBarVisibility = false;

        var d = new Date();

        $scope.meetData = {};
        $scope.meetData.meetSeconds = 0;
        $scope.meetData.ratePeriod = 1;
        $scope.meetData.id = d.getTime(); // current timestamp
        $scope.meetData.meetDate = d.getTime();

        $scope.calculator = {
            'title': '¿A qué jugamos?',
            'description': 'Puedes seleccionar el tipo de preguntas o si eres un todo terreno selecciona el modo aleatorio, y te preguntaremos de todo.',
            'currentStep': 1,
            'error': '',
            'stepsInfo': [
                {
                'title': '¿A qué jugamos?',
                'description': 'Puedes seleccionar el tipo de preguntas o si eres un todo terreno selecciona el modo aleatorio, y te preguntaremos de todo.',
                'emptyError': 'Por favor, selecciona un tipo de juego'
                },{
                'title': 'Tipo de preguntas',
                'description': '¿Quieres algún tipo de preguntas en particular?',
                'emptyError': 'Por favor, selecciona algún tipo de preguntas'
                }
            ]
        };

        $scope.movingTime = 300;

        $scope.chooseType = function (rule, step, type) {

            //if ( parseInt($scope.calculatorVal) && $scope.calculatorVal > 0 ) {
                $scope.calculator.isLeaving = true;
                $scope.calculator.isEntering = false;
                $scope.calculator.isMovingReverse = false;
                $scope.calculator.error = '';
                $scope.calculator.rule = rule;
                $scope.calculator.type = type;

                for (var i = 0; i < $scope.rules.length; i++ ) {
                    if (rule === $scope.rules[i].id ) {
                        console.log($scope.rules[i].types);
                        $scope.types = $scope.rules[i].types;
                    }

                }

                setTimeout(function(){
                    $scope.calculatorVal = 0;

                    if ( step < 2 ) {
                        $scope.calculator.title = $scope.calculator.stepsInfo[step].title;
                        $scope.calculator.description = $scope.calculator.stepsInfo[step].description;
                        $scope.calculator.currentStep = step + 1;
                    } else {
                        $rootScope.loading = true; // set preloading icon status
                        console.log("PATH", $scope.calculator.rule+'/'+$scope.calculator.type);
                        $location.path('/play/'+$scope.calculator.rule+'/'+$scope.calculator.type);
                    }

                    $scope.$apply(function () {
                        $scope.calculator.isLeaving = false;
                        $scope.calculator.isEntering = true;
                    });
                }, $scope.movingTime);

                setTimeout(function(){
                    $scope.$apply(function () {
                        $scope.calculator.isEntering = false;
                    });
                }, $scope.movingTime * 2);
            //} else {
            //    $scope.calculator.error = $scope.calculator.stepsInfo[step-1].emptyError;
            //}

            $window.scrollTo(0,0);
        };

        $scope.prevStep = function (step) {

            $scope.calculator.isEntering = true;
            $scope.calculator.isLeaving = false;
            $scope.calculator.isMovingReverse = true;

            setTimeout(function(){

                if ( step == 1 ) {
                    // attenders
                    $scope.calculatorVal = $scope.meetData.attenders;
                } else if ( step == 2) {
                    // average rate
                    $scope.calculatorVal = $scope.meetData.averageRate;
                } else if ( step == 3) {
                    // estimated time
                    $scope.calculatorVal = $scope.meetData.estimatedSeconds / 60;
                }

                if ( step < 3 ) {
                    $scope.calculator.title = $scope.calculator.stepsInfo[step-1].title;
                    $scope.calculator.description = $scope.calculator.stepsInfo[step-1].description;
                    $scope.calculator.currentStep = step;
                }

                $scope.$apply(function () {
                    $scope.calculator.isEntering = false;
                    $scope.calculator.isLeaving = true;
                });
            }, $scope.movingTime);

            setTimeout(function(){
                $scope.$apply(function () {
                    $scope.calculator.isEntering = false;
                });
            }, $scope.movingTime * 2 );

            $window.scrollTo(0,0);

        };

        $rootScope.loading = false;

        $scope.addMeeting = function () {
            $scope.nextStep(3);

            if ( $scope.calculator.error == '') {
                console.log("NO HAY ERROR");
                $scope.meetData.status = 1;
                $rootScope.loading = true; // set preloading icon status

                // add new meeting to existing lists of meetings
                if (localStorage.meetings && localStorage.meetings != "undefined") {
                    // get user meetings from localstorage
                    $scope.meetings = JSON.parse(localStorage.meetings);

                    // insert new meeting
                    $scope.meetings.push($scope.meetData);

                    // update localstorage with new meeting
                    localStorage.meetings = JSON.stringify($scope.meetings);
                }

                /*
                // save new meeting on MySQL
                $http.post('api/save', $scope.meetData)
                    .success(function(data) {
                        // this callback will be called asynchronously
                        // when the response is available

                        if( data.error ) {
                            console.warn('ERROR:',data.error.text);
                            console.log('TODO: MENSAJE DE ERROR');
                        } else if ( data.success ) {
                            // redirect to detail page of new event
                            //$location.path('/meeting/'+$scope.meetData.owner+'/'+data.success.lastInsertId);
                        }
                        $rootScope.loading = false; // set preloading icon status
                    }).error(function() {
                      // called asynchronously if an error occurs
                      // or server returns response with an error status.
                      $rootScope.loading = false; // set preloading icon status
                });
                */
            }


        };
    });


