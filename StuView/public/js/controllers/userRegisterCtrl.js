/**
 * Controller for managing registration of users
 */
materialAdmin.controller('registerCtrl', ['$scope', '$http', 'loginService', function($scope, $http, loginService) {
    $scope.registerSubmitBtnClick = function(username, firstName, lastName, userType) {
        if(userType == "Instructor") {
            $http.post('storeInstructor', {faculty_uname: username, fname: firstName, lname: lastName})
                .success(function(response) {
                    loginService.login(response.data, userType);
                });
        }
        else if(userType == "Student") {
            $http.post('storeStudent', {student_uname: username, fname: firstName, lname: lastName})
                .success(function(response) {
                    loginService.login(response.data, userType);
                });
        }
    }
}]);
