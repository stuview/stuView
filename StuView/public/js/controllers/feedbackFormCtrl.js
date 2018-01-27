materialAdmin.controller('feedbackFormCtrl', ['$rootScope', '$scope', '$http', '$state', 'sessionService', 'growlService',
		function($rootScope, $scope, $http, $state, sessionService, growlService) {

	$scope.criteria = {};

	/**
	 * Initialize page with the proper questions, criteria, etc.
	 */
	$scope.initForm = function() {
		$http.post('getAllInterviewData', {submission_id: $rootScope.card_id,
				session_id: sessionService.get('session_id'), uid: sessionService.get('uid')})
		.success(function(response) {
			$scope.interview = response.interview_id;
			$scope.questions = response.questions;
			$scope.answers = response.answers;
			$scope.student_fname = response.fname;
			$scope.student_lname = response.lname;
			$scope.title = response.title;

			console.log(response);
		});
	};

	$scope.initCriteria = function(qid) {
		$http.post('getQuestionCriteria', {session_id: sessionService.get('session_id'), uid: sessionService.get('uid'),
				question_id: qid})
		.success(function(response) {
			console.log(response);

			$scope.criteria[qid] = response;
		});
	};

	$scope.cancelFeedback = function() {
		$state.transitionTo("instructor-feedback");
	};

	$scope.submitFeedback = function() {

	};
}]);
