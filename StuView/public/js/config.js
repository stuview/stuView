materialAdmin
    .config(function ($stateProvider, $urlRouterProvider){
        $urlRouterProvider.otherwise("/sso");


        $stateProvider
            
            //------------------------------
            // SSO Placeholder
            //------------------------------

            .state ('sso-home', {
                url: '/sso',
                templateUrl: 'views/sso-home.html'
            })
            
            .state('about', {
                url: '/about',
                templateUrl: 'views/about.html'
            })

            //------------------------------
            // HOMES
            //------------------------------

            .state ('student-home', {
                url: '/home',
                templateUrl: 'views/student/student-home.html'
            })

            .state('instructor-home', {
                url: '/dashboard',
                templateUrl: 'views/instructor/instructor-home.html'
            })

            //------------------------------
            // Interviews
            //------------------------------

            .state ('student-interviews', {
                url: '/interviews',
                templateUrl: 'views/student/student-interviews.html'
            })

            .state ('student-interviewsPrecheck', {
                url: '/interviews/precheck',
                templateUrl: 'views/student/student-interviewPrecheck.html'
            })

            .state('create-interview', {
                url: '/create-interview',
                templateUrl: 'views/instructor/instructor-create-interviews.html'
            })

            .state('create-question', {
                url: '/create-question',
                templateUrl: 'views/instructor/instructor-create-question.html'
            })

            .state ('manage-interviews', {
                url: '/manage-interviews',
                templateUrl: 'views/instructor/instructor-manage-interviews.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/nouislider/jquery.nouislider.css',
                                    'vendors/farbtastic/farbtastic.css',
                                    'vendors/bower_components/summernote/dist/summernote.css',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
                                    'vendors/bower_components/chosen/chosen.min.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/input-mask/input-mask.min.js',
                                    'vendors/bower_components/nouislider/jquery.nouislider.min.js',
                                    'vendors/bower_components/moment/min/moment.min.js',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                                    'vendors/bower_components/summernote/dist/summernote.min.js',
                                    'vendors/fileinput/fileinput.min.js',
                                    'vendors/bower_components/chosen/chosen.jquery.js',
                                    'vendors/bower_components/angular-chosen-localytics/chosen.js',
                                    'vendors/bower_components/angular-farbtastic/angular-farbtastic.js'
                                ]
                            }
                        ])
                    }
                }
            })

            .state ('manage-groups', {
                url: '/manage-groups',
                templateUrl: 'views/instructor/instructor-manage-groups.html'
            })
                
            //------------------------------
            // Taking Interview Recording
            //------------------------------
            
            .state ('student-interviewSession', {
                url: '/interviews/recordInterview',
                templateUrl: 'views/student/student-interviewSession.html'
            })
                

            //------------------------------
            // Feedback
            //------------------------------

            .state ('student-feedback', {
                url: '/feedback',
                templateUrl: 'views/student/student-feedback.html'
            })

            .state ('instructor-feedback', {
                url: '/provide-feedback',
                templateUrl: 'views/instructor/instructor-feedback.html'
            })

            .state ('share-submission', {
                url: '/share-submission',
                templateUrl: 'views/instructor/instructor-share-submission.html'
            })

            .state('feedback-form', {
                url: '/feedback-form',
                templateUrl: 'views/instructor/instructor-feedback-form.html'
            })

            //------------------------------
            // Record Presentation
            //------------------------------

            .state ('student-recordPresentation', {
                url: '/recordPresentation',
                templateUrl: 'views/student/student-recordPresentation.html'
            })

            .state ('instructor-reviewPresentation', {
                url: '/review-presentation',
                templateUrl: 'views/instructor/instructor-view-presentations.html'
            })

            //------------------------------
            // Record Presentation
            //------------------------------

            .state ('instructor-groups', {
                url: '/groups',
                templateUrl: 'views/instructor/instructor-manage-groups.html'
            })
                
            //------------------------------
            // Settings
            //------------------------------

            .state ('student-settings', {
                url: '/settings',
                templateUrl: 'views/student/student-settings.html'
            })

            //------------------------------
            // Registration (currently unimplemented)
            //------------------------------
            /*.state('user-register', {
                url: '/register',
                templateUrl: 'views/register.html'
            })*/

    });
