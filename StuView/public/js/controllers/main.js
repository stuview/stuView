materialAdmin
    // =========================================================================
    // Base controller for common functions
    // =========================================================================
    .controller('materialadminCtrl', function($timeout, $state, $scope, growlService){
        //Welcome Message
        //growlService.growl('Welcome back !', 'inverse')
        // Detact Mobile Browser
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
           angular.element('html').addClass('ismobile');
        }

        // By default Sidbars are hidden in boxed layout and in wide layout only the right sidebar is hidden.
        this.sidebarToggle = {
            left: false,
            right: false
        }

        // By default template has a boxed layout
        this.layoutType = localStorage.getItem('ma-layout-status');

        // For Mainmenu Active Class
        this.$state = $state;

        //Close sidebar on click
        this.sidebarStat = function(event) {
            if (!angular.element(event.target).parent().hasClass('active')) {
                this.sidebarToggle.left = false;
            }
        };

        //Listview Search (Check listview pages)
        this.listviewSearchStat = false;

        this.lvSearch = function() {
            this.listviewSearchStat = true;
        }

        //Listview menu toggle in small screens
        this.lvMenuStat = false;

        //Blog
        this.wallCommenting = [];

        this.wallImage = false;
        this.wallVideo = false;
        this.wallLink = false;

        //Skin Switch
        this.currentSkin = 'red';

        this.skinList = [
            'lightblue',
            'bluegray',
            'red',
            'teal',
            'green',
            'orange',
            'blue',
            'purple'
        ]

        this.skinSwitch = function (color) {
            this.currentSkin = color;
        }

    })


    // =========================================================================
    // Header Controller
    // =========================================================================
    .controller('headerCtrl', function($timeout){


        // Top Search
        this.openSearch = function(){
            angular.element('#header').addClass('search-toggled');
            angular.element('#top-search-wrap').find('input').focus();
        };

        this.closeSearch = function(){
            angular.element('#header').removeClass('search-toggled');
        };

        //Clear Notification
        this.clearNotification = function($event) {
            $event.preventDefault();

            var x = angular.element($event.target).closest('.listview');
            var y = x.find('.lv-item');
            var z = y.size();

            angular.element($event.target).parent().fadeOut();

            x.find('.list-group').prepend('<i class="grid-loading hide-it"></i>');
            x.find('.grid-loading').fadeIn(1500);
            var w = 0;

            y.each(function(){
                var z = $(this);
                $timeout(function(){
                    z.addClass('animated fadeOutRightBig').delay(1000).queue(function(){
                        z.remove();
                    });
                }, w+=150);
            });

            $timeout(function(){
                angular.element('#notifications').addClass('empty');
            }, (z*150)+200);
        }

        // Clear Local Storage
        this.clearLocalStorage = function() {

            //Get confirmation, if confirmed clear the localStorage
            swal({
                title: "Are you sure?",
                text: "All your saved localStorage values will be removed",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#F44336",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            }, function(){
                localStorage.clear();
                swal("Done!", "localStorage is cleared", "success");
            });
        };

        //Fullscreen View
        this.fullScreen = function() {
            //Launch
            function launchIntoFullscreen(element) {
                if(element.requestFullscreen) {
                    element.requestFullscreen();
                } else if(element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if(element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                } else if(element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                }
            }

            //Exit
            function exitFullscreen() {
                if(document.exitFullscreen) {
                    document.exitFullscreen();
                } else if(document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if(document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }

            if (exitFullscreen()) {
                launchIntoFullscreen(document.documentElement);
            }
            else {
                launchIntoFullscreen(document.documentElement);
            }
        }

    })

    //=================================================
    // Footer Controller
    //=================================================
    .controller('footerCtrl', function ($scope) {
        //console.log("Team Stuview");
    })

    //=================================================
    // Student Sidebar Controller
    //=================================================

    .controller('studentSideBar', ['$scope', 'loginService', 'sessionService',
	    function ($scope, loginService, sessionService) {

        $scope.firstName = sessionService.get('fname');
        $scope.lastName = sessionService.get('lname');

        $scope.logout = function() {
            loginService.logout();
        };
    }])

    // =========================================================================
    // Instructor Sidebar Controller
    // =========================================================================
    .controller('instructorSideBar', ['$scope', 'loginService', 'sessionService',
	    function ($scope, loginService, sessionService) {

        $scope.fname = sessionService.get('fname');
        $scope.lname = sessionService.get('lname');

        $scope.logout = function() {
            //console.log("instructor logout");
            loginService.logout();
        };
    }])

    // =========================================================================
    // Student Home Controller
    // =========================================================================
    .controller('studentHomeCtrl', ['$scope', '$http', 'sessionService', function ($scope, $http, sessionService) {
        $scope.interviewCount = 0;
        var uname = sessionService.get('uname');

        //Counting number of uncompleted assigned interviews.
        //'getAssignments' only retrieves uncompleted interviews.
        $http.post('getAssignments', {'student_uname': uname, 'session_id': sessionService.get('session_id'),
		   	'uid': sessionService.get('uid')}).success(function (data) {
            $scope.interviewCount = data.length;
        });

    }])

    // =========================================================================
    // Record Video Controller
    // =========================================================================
    .controller('recordvideoCtrl', function($scope, $log){
        // Fire up the webcam preview
        var videoElement = document.getElementById('camPreview');
        navigator.mediaDevices.getUserMedia(
            {
                audio: false,
                video: {
                    width:  {min: 400, ideal: 400, max: 400},
                    height: {min: 400, ideal: 400, max: 400}
                }
            })
            .then(function(stream){
                videoElement.src = URL.createObjectURL(stream);
                videoElement.play();
            });
    })

    // =========================================================================
    // Instructor Create Interviews Controller
    // =========================================================================
    .controller('instructorCreateInterviewsCtrl', ['$scope', '$rootScope', '$http', 'sessionService',
			function($scope, $rootScope, $http, sessionService){

        var practice = 0;

        var uname = sessionService.get('uname');


        // console.log(uname);

        $scope.submitInterview = function(){

            $rootScope.card_id = -1 + "";

            if($scope.interviewType == "Practice"){
                practice = 1;
            }

            // Submits to database
            $http.post('storeInterview',{title: $scope.interview.title,
                description: $scope.interview.description,
                time_limit: $scope.interview.time_limit,
                uname: uname, practice: practice, 'session_id': sessionService.get('session_id'),
			  'uid': sessionService.get('uid')})
                .then(function (response) {
                    var interviewBackJson = response.data;
                    console.log("ID back from the server: " + interviewBackJson.id);
                    $rootScope.card_id = interviewBackJson.id + "";
                });

        };
    }])

    // =========================================================================
    // Instructor Create Question Controller
    // =========================================================================
    .controller('instructorCreateQuestionCtrl', ['$scope', '$rootScope', '$http', 'sessionService',
		function ($scope, $rootScope, $http, sessionService) {

        $scope.questionNumber = 1;
        $scope.rubric = [];

        $http.post('getQuestions', {interview_id: $rootScope.card_id, 'session_id': sessionService.get('session_id'),
				'uid': sessionService.get('uid')}).then(function (dataBack) {
            $scope.questionNumber = dataBack.data.length + 1;
            console.log(dataBack.data.length + " questions already in the interview");
         });

        $scope.submitQuestion = function () {


            console.log($rootScope.card_id);
            console.log($scope.rubric);
            console.log($scope.question);

            $scope.questionNumber = $scope.questionNumber + 1;

            $http.post('storeQuestion', {interview_id: $rootScope.card_id,
                question: $scope.question,
                criteria: $scope.rubric, 'session_id': sessionService.get('session_id'),
			  'uid': sessionService.get('uid')})
                .then(function (dataBack) {
                    // console.log(dataBack.data);
                });
        };

        $scope.saveCriteria = function (dataIn) {
            // Validate the input before we go adding it to our criteria list
            if(!dataIn || typeof(dataIn) != 'string' || !dataIn.trim())
                return;

            var inRubric = $scope.rubric.indexOf(dataIn);

            if (inRubric < 0) {
                $scope.rubric.push(dataIn);
                console.log($scope.rubric);
            }
            else {
                console.log("This criteria already exists");
            }
        };
    }])

    // =========================================================================
    // Student Interviews Controller
    // =========================================================================
    .controller('studentinterviewsCtrl', ['$scope', '$rootScope', '$http', 'sessionService',
	    		function ($scope, $rootScope, $http, sessionService) {
        $http.post('getAssignments', {student_uname: sessionService.get('uname'),
		   'session_id': sessionService.get('session_id'), 'uid': sessionService.get('uid')}).success(function (data) {
            $scope.testData = data;
        });

        $scope.setInterviewInfo = function (currentInterview) {
            $rootScope.currentInterview = currentInterview;
        };
    }])

    // =========================================================================
    // Session Controller
    // =========================================================================
    .directive('swalQuestion', function(){
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.click(function(){
                    swal({
                        title: "Are you sure?",
                        text: "You will not be able to recover this question!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, delete it!",
                        cancelButtonText: "No, cancel plx!",
                        closeOnConfirm: false,
                        closeOnCancel: false
                    }, function(isConfirm){
                        if (isConfirm) {
                            swal("Deleted!", "Your question has been deleted.", "success");
                        } else {
                            swal("Cancelled", "Your question is safe :)", "error");
                        }
                    });
                });
            }
        }
    })

    // =========================================================================
    // Instructor FeedBack Controller
    // =========================================================================
    .controller('instructorFeedbackCtrl', ['$scope', '$http', 'sessionService',
			function ($scope, $http, sessionService) {
		$http.post('getInterviews', {'session_id': sessionService.get('session_id'), 'uid': sessionService.get('uid')})
		.success(function(data) {
			// console.log(data);
			$scope.feedbackCards = data;
        });
    }])

    // =========================================================================
    // Instructor Feedback Input Controller
    // =========================================================================
    .controller('instructorFeedbackInputCtrl', ['$rootScope', '$scope', '$http', 'sessionService',
	    		function ($rootScope, $scope, $http, sessionService) {
				$http.post('getInterviews', {
					'session_id': sessionService.get('session_id'),
					'uid': sessionService.get('uid')
				})
						.success(function (data) {
							$scope.feedbackCards = data;
						});


				$scope.cardName = $rootScope.card_id.title;
				$scope.cardTime = $rootScope.card_id.time;
				$scope.cardDesc = $rootScope.card_id.description;
				$scope.groupId = $rootScope.card_id.groupId;
				$scope.groupName = $rootScope.card_id.groupName;
    }])

    // =========================================================================
    // Instructor Share Submission Controller
    // =========================================================================
    .controller('instructorShareSubmissionCtrl', ['$scope','$rootScope', '$http', 'sessionService',
            function ($scope, $rootScope, $http, sessionService) {
        $scope.submissionData = [];
        var submissionID = $rootScope.card_id;

        $http.post('getIndividualSubmission', {submission_id: submissionID, session_id: sessionService.get('session_id'),
                uid: sessionService.get('uid')}).success(function (data) {
            $scope.submissionData = data;
            $scope.studentName = $scope.submissionData[0].fname + " " + $scope.submissionData[0].lname;
            $scope.interviewTitle = $scope.submissionData[0].title;
        });

        $scope.sendFeedbackEmail = function () {
            $http.post('sendFeedbackEmail', {student_name: $scope.studentName, assessors_email: $scope.assessorEmail,
                    session_id: sessionService.get('session_id'), uid: sessionService.get('uid')}).then(function (data) {
                console.log(data.data);
            });
        };

    }])

    // =========================================================================
    // Student Feedback Controller
    // =========================================================================
    .controller('studentFeedbackController', ['$scope', '$http', 'sessionService',
			function ($scope, $http, sessionService) {
		$http.post('getInterviews', {'session_id': sessionService.get('session_id'), 'uid': sessionService.get('uid')})
		.success(function (data) {
			$scope.feedbackCards = data;
		});
    }]);
