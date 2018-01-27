/**
 * Controller for authenticating users
 */
materialAdmin.controller('loginCtrl', ['$scope', '$http', '$timeout', '$state', "$rootScope", "$location",
		"loginService", "sessionService", 'growlService',
    function ($scope, $http, $timeout, $state, $rootScope, $location, loginService, sessionService, growlService) {

        this.login = 1;
        this.register = 0;
        this.forgot = 0;

        $rootScope.$on("$locationChangeStart", function(event, next, current) {

            var restricted = [];
            var safePages = ['/sso', '/about'];
            angular.forEach($state.get(), function(val) {
            	 // console.log(safePages.indexOf(val.url) === -1);
                if(safePages.indexOf(val.url) === -1) {
                    restricted.push(val.url);
                }
            });

            var pieces = next.split("/");
            var path = "/" + pieces[pieces.length-1];

            var restrictedPage = restricted.indexOf(path) != -1;
            loginService.isLoggedIn().then(function(response) {
                if(!angular.fromJson(response.data) && restrictedPage) {
                	$state.transitionTo("sso-home");
                }
            });
        });

		$scope.userLogin = function(uname, role) {
			switch(role) {
				case 'Student':
					loginService.init(function() {
						$http.post('getStudent', {student_uname: uname, 'session_id': sessionService.get('session_id'),
							'uid': sessionService.get('uid')}).then(function (response) {
							//console.log(response.data);
							var sessData = {
								'uname' : response.data.student_uname,
								'fname' : response.data.fname,
								'lname' : response.data.lname
							};
							loginService.login(sessData, role);

							$scope.firstName = sessData.fname;
							$scope.lastName = sessData.lname;
						}, function() {
							loginService.logout();
							growlService.growl('Invalid user. Please try again.', 'inverse');
						});
					});
					break;
				case 'Instructor':
					loginService.init(function () {
						$http.post('getInstructor', {faculty_uname: uname, 'session_id': sessionService.get('session_id'),
							'uid': sessionService.get('uid')}).then(function (response) {
							//console.log(response.data);
							if(response.data == '') {
								$state.transitionTo("sso-home");
							}
							else {
								var sessData = {
									'uname' : response.data.faculty_uname,
									'fname' : response.data.fname,
									'lname' : response.data.lname
								};
								loginService.login(sessData, role);

								$scope.fname = sessData.fname;
								$scope.lname = sessData.lname;
							}
							//console.log($state.get());
						}, function() {
							loginService.logout();
							growlService.growl('Invalid user. Please try again.', 'inverse');
						});
					});
					break;
			}
		};

        $scope.loginEnterBtn = function(userType) {
            if(userType == "Student") {
                $timeout(function() {
                    angular.element("#studentBtn").triggerHandler('click');
                });
            }
            else if(userType == "Instructor") {
                $timeout(function() {
                    angular.element("#instructorBtn").triggerHandler('click');
                });
            }
        };

    }]);