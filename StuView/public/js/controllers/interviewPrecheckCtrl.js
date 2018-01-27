materialAdmin
// =========================================================================
// Interview Precheck Controller
// =========================================================================
.controller('interviewPrecheckCtrl', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    $scope.init = function(){

        if($rootScope.currentInterview.practice == 1)
            $state.go("student-interviewSession");
    }
}]);