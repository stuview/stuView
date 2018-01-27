/**
 * Service for managing user login/logout
 */
materialAdmin.factory('loginService', function($http, $state, sessionService) {
    return {
    	   init: function(callback) {
			$http.post('initialize', {}).then(function(response) {
				var respData = angular.fromJson(response.data);

				sessionService.setAll({
					'session_id': respData.session_id,
					'uid'       : respData.uid
				});

				callback();
			});
	   },

        login: function(data, role) {
            // use PHP endopint for logging users in
            $http.post('login', data).then(function(response) {
                //console.log(response);
                if(response.data) {
                	var jsonData = angular.fromJson(response.data);

				 sessionService.setAll({
					 'uname'     : jsonData.uname,
					 'fname'     : jsonData.fname,
					 'lname'     : jsonData.lname,
					 'session_id': jsonData.session_id,
					 'uid'       : jsonData.uid
				 });

                    if(role === "Student") {
                        $state.transitionTo('student-home');
                    }
                    else if(role === "Instructor") {
                        $state.transitionTo('instructor-home');
                    }
                }
                else {
                    $state.transitionTo('sso-home');
                }
            });
        },

        logout: function() {
		   $http.post('logout', {'session_id': sessionService.get('session_id'), 'uid': sessionService.get('uid')})
                       .success(function() {
			   sessionService.destroy({'uid': sessionService.get('uid'), 'uname': sessionService.get('uname'),
				   'fname': sessionService.get('fname'), 'lname': sessionService.get('lname'),
				   'session_id': sessionService.get('session_id')});
			   $state.transitionTo('sso-home');
		   });
        },

        isLoggedIn: function() {
            return $http.post('isLoggedIn', {'session_id': sessionService.get('session_id'), 'uid': sessionService.get('uid'),
			  'uname': sessionService.get('uname')});
        }
    };
});
