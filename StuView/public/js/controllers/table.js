materialAdmin.controller('tableCtrl', ['$rootScope', '$scope', '$http', 'growlService', 'sessionService',
            function($rootScope, $scope, $http, growlService, sessionService) {

		$scope.loadGroups = function() {
			$http.post('getClasses', {'session_id': sessionService.get('session_id'),
				'uid': sessionService.get('uid')})
			.then(function (response) {
				$scope.classes = response.data;
				// console.log(response);
			},
			function() {
				growlService.growl('Problem loading groups', 'inverse');
			});
		};

        $scope.getStudentsFromID = function (classId, index) {
            $scope.studentData = [];

            if(classId != -1){
                $http.post('getClassStudents', {class_id: classId, 'uid': sessionService.get('uid'),
				 	'session_id': sessionService.get('session_id')}).then(function (response) {
                    // console.log(response.data);
                    $scope.studentData[index] = response.data;
                });
            }
        };

        $scope.setInterviewInfo = function(title, time, desc, groupName, groupId){
			$rootScope.card_id = {
				title: title,
				time: time,
				description: desc,
				groupName: groupName,
				groupId: groupId
			};
        };

        $scope.addUserToGroup = function (uname, classId, index) {

            console.log(uname);
            var newStudent = -1;

            $http.post('getStudent', {student_uname: uname, 'session_id': sessionService.get('session_id'),
		  			'uid': sessionService.get('uid')}).then(function (response) {
                // console.log("response", response.data);
                newStudent = response.data;

                if(newStudent != -1) {
                    $http.post('enrollStudent', {student_uname: newStudent.student_uname,
						class_id: classId,
						'session_id': sessionService.get('session_id'),
						'uid': sessionService.get('uid')})
				.then(function (dataBack) {
					growlService.growl('Added ' + newStudent.fname + ' to group', 'inverse');
					$scope.studentData[index] = dataBack.data;
                    });
                }
                else {
                    growlService.growl('No such user ', 'inverse')
                }
            });
        };

        $scope.removeUserFromGroup = function (uname, classId, index) {

            console.log(uname);
            var oldStudent = -1;

            $http.post('getStudent', {student_uname: uname, 'uid': sessionService.get('uid'),
			  		'session_id': sessionService.get('session_id')}).then(function (response) {
                console.log("response", response.data);
                oldStudent = response.data;

                if(oldStudent != -1)
                {
                    $http.post('getStudentEnrollment', {student_uname: oldStudent.student_uname, class_id: classId,
						'session_id': sessionService.get('session_id'), 'uid': sessionService.get('uid')})
				.then(function (enrollment){
                        console.log(enrollment.data);

                        if (enrollment.data.length > 0)
                        {
                            $http.post('deleteEnrollment', {student_uname: oldStudent.student_uname, class_id: classId,
					   		'session_id': sessionService.get('session_id'), 'uid': sessionService.get('uid')})
					   .then(function (dataBack) {
                                growlService.growl('Removed ' + oldStudent.fname + ' from group', 'inverse');
                                $scope.studentData[index] = dataBack.data;
                            });
                        }
                        else
                        {
                            growlService.growl(oldStudent.fname + ' is not a member of the group', 'inverse');
                        }
                    });
                }

                else
                {
                    growlService.growl('No such user ', 'inverse');
                }
            });
        };

        $scope.addGroup = function (groupName) {

            $http.post('storeClass', {group_title: groupName, 'session_id': sessionService.get('session_id'),
			  		'uid': sessionService.get('uid')})
		  .then(function () {
			  growlService.growl(groupName + ' created', 'inverse');
			  $scope.loadGroups();
            },
		  function() {
			  growlService.growl('Error adding group', 'inverse');
		  });
        };

        $scope.updateGroup = function (newName, groupId) {
            $http.post('updateClass', {group_title: newName, class_id: groupId,
			  	'session_id': sessionService.get('session_id'), 'uid': sessionService.get('uid')})
		  .then(function(response){
                // console.log(response);
                growlService.growl('Updated group', 'inverse');
            });
        };

        $scope.deleteGroup = function (groupId) {
            $http.post('deleteClass', {class_id: groupId, 'session_id': sessionService.get('session_id'),
			  	'uid': sessionService.get('uid')})
		  .then(function(response) {
                //console.log(response);
                $scope.classes = response.data;
                growlService.growl('Removed group', 'inverse');
            });
        };

        $scope.selected = undefined;
        $scope.allStudents = undefined;

        $scope.getStudents = function () {
            //TODO make a get all students function
            $http.post('getStudents', {major_id: 1, 'session_id': sessionService.get('session_id'),
			  		'uid': sessionService.get('uid')}).then(function (response) {
                //console.log(response.data);
                $scope.allStudents = response.data;
            })
        };

    }], function($scope, $filter, $sce, ngTableParams, tableService) {
        var data = $scope.classes;

        // //Basic Example
        // this.tableBasic = new ngTableParams({
        //     page: 1,            // show first page
        //     count: 10           // count per page
        // }, {
        //     total: data.length, // length of data
        //     getData: function ($defer, params) {
        //         $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        //     }
        // });
        //
        // //Sorting
        // this.tableSorting = new ngTableParams({
        //     page: 1,            // show first page
        //     count: 10,           // count per page
        //     sorting: {
        //         name: 'asc'     // initial sorting
        //     }
        // }, {
        //     total: data.length, // length of data
        //     getData: function($defer, params) {
        //         // use build-in angular filter
        //         var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
        //
        //         $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        //     }
        // });
        //
        // //Filtering
        // this.tableFilter = new ngTableParams({
        //     page: 1,            // show first page
        //     count: 10
        // }, {
        //     total: data.length, // length of data
        //     getData: function($defer, params) {
        //         // use build-in angular filter
        //         var orderedData = params.filter() ? $filter('filter')(data, params.filter()) : data;
        //
        //         this.id = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
        //         this.name = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
        //         this.email = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
        //         this.username = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
        //         this.contact = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
        //
        //         params.total(orderedData.length); // set total for recalc pagination
        //         $defer.resolve(this.id, this.name, this.email, this.username, this.contact);
        //     }
        // })

        //Editable
        this.tableEdit = new ngTableParams({
            page: 1,            // show first page
            count: 10           // count per page
        }, {
            total: data.length, // length of data
            getData: function($defer, params) {
                $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
    })

    .controller('studentTableCtrl', ['$rootScope', '$scope', '$http', 'sessionService',
	    function ($rootScope, $scope, $http, sessionService) {

        $scope.submissionData = [];
        $scope.groups = [];
        $scope.sortType = 'lname';
        $scope.sortReverse = false;
        $scope.selected = null;
        $scope.isSelected = false;

        $scope.getAllSubmissions = function () {
            $http.post('getAllGroupsForSubmissions', {session_id: sessionService.get('session_id'), uid: sessionService.get('uid')})
		  .success(function (dataBack) {
                $scope.groups = dataBack;

                $http.post('getAllSubmissions', {session_id: sessionService.get('session_id'), uid: sessionService.get('uid')})
			 .success(function (dataBack) {
                    $scope.submissionData = dataBack;
                    $scope.submissionData.forEach(function (obj) {
                        obj.groups = [];
                    });

                    $scope.groups.forEach(function (obj) {
                        $scope.submissionData.forEach(function (obj2) {
                            if (obj2.submission_id == obj.submission_id) {
                                obj2.groups.push(obj.group_title);
                            }
                        })
                    });
                });
            });
        };

        $scope.setSelected = function(rowID) {
            if ($scope.selected == rowID)
                $scope.selected = null;
            else
                $scope.selected = rowID;
        };

        $scope.setSubmission = function() {
            $rootScope.card_id = $scope.selected;
        }

    }], function($scope, $filter, $sce, ngTableParams, tableService, growlService) {
        var data = $scope.data;

        //Editable
        this.tableEdit = new ngTableParams({
            page: 1,            // show first page
            count: 10           // count per page
        }, {
            total: data.length, // length of data
            getData: function($defer, params) {
                $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
    });
