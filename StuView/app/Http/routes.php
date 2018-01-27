<?php

/*
|--------------------------------------------------------------------------
| Routes File
|--------------------------------------------------------------------------
|
| Here is where you will register all of the routes in an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

Route::get('/', 'WelcomeController@index');

Route::any('/test', 'WelcomeController@test');

Route::any('/youtubetest', 'WelcomeController@youtube');

Route::post('getStudent', 'StudentController@getStudent');

Route::post('getStudents', 'StudentController@getStudents');

Route::post('getInstructor', 'AssessorController@getInstructor');

Route::post('getIndustryAssessor', 'AssessorController@getIndustryAssessor');

Route::post('getInterview', 'ProblemController@getInterview');

Route::post('getQuestions', 'ProblemController@getQuestions');

Route::post('getInterviews', 'ProblemController@getInterviews');

Route::post('getRubric', 'ProblemController@getRubric');

Route::post('getCriteria', 'ProblemController@getCriteria');

Route::post('getQuestionCriteria', 'SubmissionController@getQuestionCriteria');

Route::post('storeStudent', 'StudentController@storeStudent');

Route::post('storeFaculty', 'AssessorController@storeInstructor');

Route::post('storeIndustryAssessor', 'AssessorController@storeIndustryAssessor');

Route::post('storeInterview', 'ProblemController@storeInterview');

Route::post('deleteInterview', 'ProblemController@deleteInterview');

Route::post('storeQuestion', 'ProblemController@storeQuestion');

Route::post('storeAnswers', 'SubmissionController@storeAnswers');

Route::post('storeAssignment', 'ProblemController@storeAssignment');

Route::post('getAssignments', 'ProblemController@getAssignments');

Route::post('getAssignedStudents', 'ProblemController@getAssignedStudents');

Route::post('getAssignedGroups', 'ProblemController@getAssignedGroups');

Route::post('storeSubmissionChunk', 'SubmissionController@storeSubmissionChunk');

Route::post('mergeSubmissionChunks', 'SubmissionController@mergeSubmissionChunks');

Route::post('deleteTemporaryFile', 'SubmissionController@deleteTemporaryFile');

Route::post('storeMedia', 'SubmissionController@storeMedia');

Route::post('getAssessments', 'SubmissionController@getAssessments');

Route::post('getResponses', 'SubmissionController@getResponses');

Route::post('getAllInterviewData', 'SubmissionController@getAllInterviewData');

Route::post('storeClassAssignment', 'ProblemController@storeClassAssignment');

Route::post('storeCriteria', 'ProblemController@storeCriteria');

Route::post('updateInterview', 'ProblemController@updateInterview');

Route::post('updateRubric', 'ProblemController@updateRubric');

Route::post('updateCriteria', 'ProblemController@updateCriteria');

Route::post('deleteCriteria', 'ProblemController@deleteCriteria');

Route::post('updateQuestion', 'ProblemController@updateQuestion');

Route::post('deleteQuestion', 'ProblemController@deleteQuestion');

Route::post('updateAssignmentDueDate', 'ProblemController@updateAssignmentDueDate');

Route::post('updateClassAssignmentDueDate', 'ProblemController@updateClassAssignmentDueDate');

Route::post('deleteClassAssignment', 'ProblemController@deleteClassAssignment');

Route::post('deleteAssignment', 'ProblemController@deleteAssignment');

Route::post('removeClassAssignment', 'ProblemController@removeClassAssignment');

Route::post('updateStudent', 'StudentController@updateStudent');

Route::post('updateClass', 'StudentController@updateClass');

Route::post('getClassStudents', 'StudentController@getClassStudents');

Route::post('getClasses', 'StudentController@getClasses');

Route::post('releaseAssessments', 'SubmissionController@releaseAssessments');

Route::post('getInterviewSubmissions', 'SubmissionController@getInterviewSubmissions');

Route::post('getStudentSubmissions', 'SubmissionController@getStudentSubmissions');

Route::post('getClassSubmissions', 'SubmissionController@getClassSubmissions');

Route::post('getAllSubmissions', 'SubmissionController@getAllSubmissions');

Route::post('getIndividualSubmission', 'SubmissionController@getIndividualSubmission');

Route::post('sendFeedbackEmail', 'SubmissionController@sendFeedbackEmail');

Route::post('getAllGroupsForSubmissions', 'SubmissionController@getAllGroupsForSubmissions');

Route::post('storeAssessment', 'SubmissionController@storeAssessment');

Route::post('storeResponse', 'SubmissionController@storeResponse');

Route::post('updateResponse', 'SubmissionController@updateResponse');

Route::post('enrollStudent', 'StudentController@enrollStudent');

Route::post('getStudentEnrollment', 'StudentController@getStudentEnrollment');

Route::post('deleteEnrollment', 'StudentController@deleteEnrollment');

Route::post('storeClass', 'StudentController@storeClass');

Route::post('deleteClass', 'StudentController@deleteClass');

Route::post('getNotifications', 'NotificationsController@getNotifications');

Route::post('deleteNotification', 'NotificationsController@deleteNotification');

Route::post('deleteNotifications', 'NotificationsController@deleteNotifications');

Route::post('login', 'Auth\AuthController@userLogin');

Route::post('isLoggedIn', 'Auth\AuthController@isLoggedIn');

Route::post('logout', 'Auth\AuthController@userLogout');

Route::post('initialize', 'Auth\AuthController@initSession');

Route::any('redirectTest', 'Controller@redirectTest');

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| This route group applies the "web" middleware group to every route
| it contains. The "web" middleware group is defined in your HTTP
| kernel and includes session state, CSRF protection, and more.
|
*/

Route::group(['middleware' => ['web']], function () {
    //
});
