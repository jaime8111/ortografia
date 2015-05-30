'use strict';

angular.module('meetcost')
    .controller('DetailCtrl', function ($scope, $filter, $http, $window, $routeParams, $rootScope, $location, meetServices) {
        loadData($rootScope, $http);
        $rootScope.pageInfo = {
            'id': 'detailPage',
            'class': 'detailPage',
            'title': 'Juego ' + $routeParams.rule
        };

        $scope.movingTime = 300;
        $scope.calculator = {
            'currentStep': 1,
        };

        $scope.questions = [];
        $scope.calculator.showQuiz = true;
        $scope.okAnswers = 0;
        $scope.totalAnswers = $rootScope.settings.questionsAmount;

        // hide fixed bar by default
        $rootScope.toggleBarVisibility = false;

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }

        $rootScope.$watch('loaded', function() {
            if ($rootScope.loaded) {
                var filteredQuestions;

                if ( $routeParams.rule === 'all' && $routeParams.type === 'all' ) {
                    filteredQuestions = $filter('filter')($rootScope.data.questions);
                } else if ( $routeParams.rule === 'all' ) {
                    filteredQuestions = $filter('filter')($rootScope.data.questions, {type:$routeParams.type});
                } else if ( $routeParams.type === 'all' ) {
                    filteredQuestions = $filter('filter')($rootScope.data.questions, {rule:$routeParams.rule});
                } else {
                    filteredQuestions = $filter('filter')($rootScope.data.questions, {rule:$routeParams.rule, type:$routeParams.type});
                }


                for (var i = 0; i < $rootScope.settings.questionsAmount; i++) {
                    var randomIndex = getRandomInt(0, filteredQuestions.length);
                    var tmpOptions = filteredQuestions[randomIndex].options;

                    if ( !angular.isObject(tmpOptions) ) {
                        tmpOptions = tmpOptions.split(',');

                        for (var k = 0; k < tmpOptions.length; k++) {
                            tmpOptions[k] = tmpOptions[k].trim();

                            if ( tmpOptions[k] == 'sin h' ) {
                                tmpOptions[k] = '<strike>h</strike>';
                            }
                        }
                    }
                    console.log(tmpOptions);
                    filteredQuestions[randomIndex].options = tmpOptions;
                    $scope.questions.push(filteredQuestions[randomIndex]);
                }
                console.log($scope.questions);

                $scope.currentQuestion = $scope.questions[0];
                $scope.currentQuestion.position = 0;
            }
        });

        // start of TIMER
        var timer;

        $scope.setAnswer = function (option, question){
            for ( var i = 0; i < question.options.length; i++ ) {
                if ( question.options[i] === option ) {
                    if ( i == question.answer ) {
                        $scope.okAnswers++;

                        $rootScope.showSucessPanel = true;

                        setTimeout(function () {
                            $rootScope.nextQuestion();
                        }, 500);

                        setTimeout(function () {
                            $rootScope.showSucessPanel = false;
                        }, 1000);
                    } else {
                        $rootScope.correctAnswer = $scope.getCorrectCompleteAnswer(question);
                        $rootScope.showErrorPanelMsg = question.msg;
                        $rootScope.showErrorPanel = true;
                    }
                }
            }
        };

        $scope.getCorrectCompleteAnswer = function ( question ) {
            var answer = question.options[question.answer];
            console.log(answer, answer.indexOf("strike"));
            if ( answer.indexOf("strike") >= 0 ) {
                answer = '';
            }
            var fullAnswer = question.question.replace("_", answer);
            return fullAnswer;
        };

        $rootScope.nextQuestion = function () {
            var showQuiz = true;

            $rootScope.showErrorPanel = false;


            $scope.calculator.isLeaving = true;
            $scope.calculator.isEntering = false;


            setTimeout(function(){
                console.log("LOAD NEW QUEST", $scope.currentQuestion.position, $scope.questions);

                var newPosition = $scope.currentQuestion.position + 1;
                console.log($scope.currentQuestion.position, $scope.questions);

                if ( $scope.questions[newPosition] ) {
                    $scope.currentQuestion = $scope.questions[newPosition];
                    $scope.currentQuestion.position = newPosition;
                } else {
                    showQuiz = false;
                }


                $scope.$apply(function () {
                    $scope.calculator.isLeaving = false;
                    $scope.calculator.isEntering = true;
                    $scope.calculator.showQuiz = showQuiz;
                });
            }, $scope.movingTime);

            setTimeout(function(){
                $scope.$apply(function () {
                    $scope.calculator.isEntering = false;
                });
            }, $scope.movingTime * 2);

            $window.scrollTo(0,0);
        };

        function setTimer() {
            $scope.currentCost = $scope.costPerSecond * $scope.timer;
            $scope.currentCostPerPerson = $scope.costPerSecondAndAttender * $scope.timer;
        }

        function stopTimer() {
            $scope.disabledStart = false;
            clearInterval(timer);
            meetServices.updateMeeting($scope.detailMeeting.id,$scope.timer,false, $scope);

        }

        function startTimer() {
            if ( !$scope.disabledStart ) {
                $scope.disabledStart = true;
                timer = setInterval(function () {
                    $scope.timer++;

                    $scope.getTimePerc();

                    $scope.$apply(function () {
                        setTimer();
                    });
                }, 1000);
            }
        }

        $scope.startTimer = function (){
            startTimer();
        };

        $scope.stopTimer = function (){
            stopTimer();
            $location.path('/list');
        };

        $scope.pauseTimer = function (){
            stopTimer();
        };
        // end of TIMER


        $scope.updateMeeting = function(id, seconds, refresh, $scope) {
            meetServices.updateMeeting(id, seconds, refresh, $scope);
        }

        $scope.getTimePerc = function () {
            $scope.timerPerc = $scope.timer * 100 / $scope.detailMeeting.estimatedSeconds;

            if ($scope.timerPerc >= 100) {
                $scope.extratime = true;
                $scope.timerPerc = $scope.timerPerc % 100;
            }

            $scope.timerRotation = 360/100*$scope.timerPerc;
        }

        $scope.drawDetailMeeting = function(meeting) {
            $scope.detailMeeting = meeting;

            // SET TIMER
            $scope.timer = $scope.detailMeeting.meetSeconds;
            var ratePeriods = JSON.parse(meetServices.getRatePeriods()),
                costRate = meetServices.getCostRate(ratePeriods, $scope.detailMeeting.ratePeriod);

            meetServices.setMeetingCosts($scope, $scope.detailMeeting, costRate);

            $scope.estimatedCost = $scope.costPerSecond * $scope.detailMeeting.estimatedSeconds;
            $scope.estimatedCostByHour = $scope.costPerSecond * 60 * 60;

            $scope.getTimePerc();


            $scope.loaded = true;
        }

        $rootScope.loading = true; // set preloading icon status
        // init load with data saved on localstorage
        /*if (localStorage.meetings && localStorage.meetings != "undefined") {
            var storagedMeetings = JSON.parse(localStorage.meetings);
            for ( var i in storagedMeetings ) {
                if ( storagedMeetings[i].id == $routeParams.id && storagedMeetings[i].owner === localStorage.owner ) {
                    $scope.drawDetailMeeting(storagedMeetings[i]);
                    $rootScope.loading = false; // set preloading icon status
                }
            }
        }*/

    }).filter('secondsToClock', function () {
        function numberFixedLen(n,len) {
            var num = parseInt(n, 10);
            len = parseInt(len, 10);
            if (isNaN(num) || isNaN(len)) {
                return n;
            }
            num = ''+num;
            while (num.length < len) {
                num = '0'+num;
            }
            return num;
        }

        return function (timer) {
            var sym = '';
            if (timer < 0) {
                timer *= -1;
                sym = '-';
            }

            var forHours = parseInt(timer / 3600),
                remainder = timer % 3600,
                forMinutes = parseInt(remainder / 60),
                forSeconds = '<small class="sec">:'+numberFixedLen(parseInt(remainder % 60),2)+'</small>',
                result = forMinutes+forSeconds;

            if ( forHours > 0 ) {
                result = forHours+':'+numberFixedLen(forMinutes,2)+forSeconds;
            }

            return sym+''+result;
        };
    }).filter('customCurrency', function () {
        return function (value) {
            value = value+'';
            var parts = value.split('.');

            if ( parts[1] ) {
                parts[1] = parts[1]+'';
                parts[1] = parts[1].substring(0, 2);
            } else {
                parts[1] = '00';
            }
            return parts[0]+'<small class="sep">.</small><small class="dec">'+parts[1]+'</small>';
        };
    }).filter('timeago', function () {
        //time: the time
        //local: compared to what time? default: now
        //raw: wheter you want in a format of "5 minutes ago", or "5 minutes"
        return function (time, local, raw) {
            if (!time) return '';

            if (!local) {
                (local = Date.now());
            }

            if (angular.isDate(time)) {
                time = time.getTime();
            } else if (typeof time === 'string') {
                time = new Date(time).getTime();
            }

            if (angular.isDate(local)) {
                local = local.getTime();
            }else if (typeof local === 'string') {
                local = new Date(local).getTime();
            }

            if (typeof time !== 'number' || typeof local !== 'number') {
                return;
            }

            var offset = Math.abs((local - time) / 1000),
                span = [],
                MINUTE = 60,
                HOUR = 3600,
                DAY = 86400,
                WEEK = 604800,
                //MONTH = 2629744,
                YEAR = 31556926,
                DECADE = 315569260;

            //if (offset <= MINUTE)              span = [ '', raw ? 'now' : 'less than a minute' ];
            if (offset <= MINUTE)              span = [ '', raw ? 'now' : 'now' ];
            else if (offset < (MINUTE * 60))   span = [ Math.round(Math.abs(offset / MINUTE)), 'min' ];
            else if (offset < (HOUR * 24))     span = [ Math.round(Math.abs(offset / HOUR)), 'hr' ];
            else if (offset < (DAY * 7))       span = [ Math.round(Math.abs(offset / DAY)), 'day' ];
            else if (offset < (WEEK * 52))     span = [ Math.round(Math.abs(offset / WEEK)), 'week' ];
            else if (offset < (YEAR * 10))     span = [ Math.round(Math.abs(offset / YEAR)), 'year' ];
            else if (offset < (DECADE * 100))  span = [ Math.round(Math.abs(offset / DECADE)), 'decade' ];
            else                               span = [ '', 'a long time' ];

            span[1] += (span[0] === 0 || span[0] > 1) ? 's' : '';
            span = span.join(' ');

            if ( offset <= MINUTE ) {
                raw = true;
            }
            if (raw === true) {
                return span;
            }
            return (time <= local) ? span + ' ago' : 'in ' + span;
        };
    });


