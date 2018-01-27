materialAdmin.controller('manageinterviewsCtrl', ['$scope', '$rootScope', '$http', 'sessionService', 'growlService',
function ($scope, $rootScope, $http, sessionService, growlService){

	// Get functions for manage interviews page

	$scope.questions = [];
	$scope.numOfQuestions = [];
	$scope.rubric = [];
	$scope.rubricId = -1;
	$scope.allGroups = [];
	$scope.allStudents = [];
	$scope.currentInstructor = '';

	$scope.getInstructorId = function () {
		$scope.currentInstructor = sessionService.get('uname');
	};

	$http.post('getInterviews', {'session_id': sessionService.get('session_id'),
		'uid': sessionService.get('uid')}).success(function (data) {
		// console.log($scope.currentInstructor);
		$scope.interviewsForManagement = data;
	});

	$scope.setInterviewInfo = function (interviewId) {
		$rootScope.card_id = interviewId;
	};

	$scope.getRubricForQuestion = function (questionId) {
		$http.post('getRubric', {question_id: questionId, 'session_id': sessionService.get('session_id'),
			'uid': sessionService.get('uid')}).then(function (response) {
			$scope.rubricId = response.data.rubric_id;

			if($scope.rubricId != -1){
				$http.post('getCriteria', {rubric_id: $scope.rubricId, 'session_id': sessionService.get('session_id'),
					'uid': sessionService.get('uid')}).then(function (response) {
					// console.log(response.data);
					$scope.rubric[questionId] = response.data;
				});
			}
		});
	};

	$scope.getQuestionsForInterview = function (interviewId) {
		$http.post('getQuestions', {interview_id: interviewId, 'session_id': sessionService.get('session_id'),
			'uid': sessionService.get('uid')}).then(function (response) {
			$scope.questions[interviewId] = response.data;
			$scope.numOfQuestions[interviewId] = response.data.length;
		});
	};


	$scope.getGroups = function () {
		$http.post('getClasses', {'session_id': sessionService.get('session_id'),
			'uid': sessionService.get('uid')}).success(function (data) {
			$scope.allGroups = data;
		});
	};

	$scope.getStudents = function () {
		$http.post('getStudents', {major_id: 1, 'session_id': sessionService.get('session_id'),
			'uid': sessionService.get('uid')}).success(function (data) {
			$scope.allStudents = data;
		});
	};


	//Getting only those students assigned to the given interview id.
	$scope.getAssignedStudents = function (interviewId) {

		// console.log(interviewId);
		$http.post('getAssignedStudents', {interview_id: interviewId, 'session_id': sessionService.get('session_id'),
			'uid': sessionService.get('uid')}).success(function (data) {
			$scope.assignedStudents= data;
			// console.log(data);
		});
	};

	$scope.getAssignedGroups = function (interviewId) {

		// console.log(interviewId);
		$http.post('getAssignedGroups', {interview_id: interviewId, 'session_id': sessionService.get('session_id'),
			'uid': sessionService.get('uid')})
				.success(function(data) {
					$scope.assignedGroups = data;
					//console.log(data);
				});
	};


	$scope.unassignStudent = function (interviewId, uname) {
		// console.log(uname);
		$http.post('deleteAssignment', {interview_id: interviewId, student_uname: uname,
			'session_id': sessionService.get('session_id'),
			'uid': sessionService.get('uid')})
				.success(function (data) {
					// console.log(data);
					growlService.growl(data.title + " unassigned from " + data.student, 'inverse');
				});
	};

	$scope.unassignGroup = function (interviewId, classId){

		$http.post('removeClassAssignment', {interview_id: interviewId, class_id: classId,
			'session_id': sessionService.get('session_id'), 'uid': sessionService.get('uid')})
				.success(function (data) {
					//console.log(data);
					growlService.growl(data.title + " unassigned from " + data.group + " group.", 'inverse');
				});

	};

	// Delete operations for management page

	$scope.deleteInterview = function (interviewId) {
		$http.post('deleteInterview', {interview_id: interviewId, 'uname': sessionService.get('uname'),
			'session_id': sessionService.get('session_id'), 'uid': sessionService.get('uid')}).then(function (response) {

			growlService.growl('Interview deleted.', 'inverse');
			$http.post('getInterviews', {'session_id': sessionService.get('session_id'),
				'uid': sessionService.get('uid')}).success(function (data) {
				$scope.interviewsForManagement = data;
			});

		});
	};

	$scope.deleteQuestion = function (questionId, interviewId) {
		$http.post('deleteQuestion', {question_id: questionId, uname: sessionService.get('uname'),
			'session_id': sessionService.get('session_id'), 'uid': sessionService.get('uid')})
				.then(function() {
					growlService.growl('Question removed.', 'inverse');
					// console.log(response);
					$http.post('getQuestions', {interview_id: interviewId, 'session_id': sessionService.get('session_id'),
						'uid': sessionService.get('uid')})
							.then(function (response) {
								$scope.questions[interviewId] = response.data;
								$scope.numOfQuestions[interviewId] = response.data.length;
							});
				});
	};

	$scope.deleteCriteria = function (criteriaId, questionId) {
		$http.post('deleteCriteria', {criteria_id: criteriaId, 'session_id': sessionService.get('session_id'),
			'uid': sessionService.get('uid')})
				.then(function () {
					growlService.growl('Criteria removed.', 'inverse');
					$scope.getRubricForQuestion(questionId);
				});
	};

	// Update for management page

	$scope.updateInterview = function (newTitle, newDescription, interviewId, newTime) {
		$http.post('updateInterview', {title: newTitle,
			description: newDescription,
			interview_id: interviewId,
			time_limit: newTime,
			'instructor_uname': sessionService.get('uname'),
			'session_id': sessionService.get('session_id'),
			'uid': sessionService.get('uid')}
		);
	};

	$scope.updateQuestion = function (questionId, newQuestion) {
		$http.post('updateQuestion', {question: newQuestion,
			question_id: questionId,
			instructor_uname: sessionService.get('uname'),
			'session_id': sessionService.get('session_id'),
			'uid': sessionService.get('uid')}
		);
	};

	$scope.updateCriteria = function (criteriaId, newDescription, questionId) {
		$http.post('updateCriteria', {criteria_description: newDescription, criteria_id: criteriaId,
			'session_id': sessionService.get('session_id'), 'uid': sessionService.get('uid')}).then(function () {

			$scope.getRubricForQuestion(questionId);

		});
	};

	$scope.assignStudent = function (interviewID, student_uname, dueDate) {

		// console.log(instructor_uname);

		$http.post('storeAssignment', {interview_id: interviewID, student_uname: student_uname, due_date: dueDate,
			instructor_uname: $scope.currentInstructor, 'session_id': sessionService.get('session_id'),
			'uid': sessionService.get('uid')})
				.then(function (response) {
					// console.log(response);
					growlService.growl('Interview assigned', 'inverse');
				});
	};

	$scope.assignGroup = function (interviewId, classID, groupDate) {

		$http.post('storeClassAssignment', {interview_id: interviewId, class_id: classID, due_date: groupDate,
			instructor_uname: $scope.currentInstructor, 'session_id': sessionService.get('session_id'),
			'uid': sessionService.get('uid')})
				.then(function (response) {
					growlService.growl('Interview assigned to ' + response.data + " group", 'inverse');
				});
	};

	$scope.storeCriteria = function (rubric, criteriaDescription) {
		// console.log(rubric, criteriaDescription);
		$http.post('storeCriteria', {session_id: sessionService.get('session_id'),
				uid: sessionService.get('uid'),
				rubric_id: rubric,
				criteria_description: criteriaDescription})
		.success(function() {
			growlService.growl('Criteria added', 'inverse');
		});
	};

}]);