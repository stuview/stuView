materialAdmin
// =========================================================================
// Interview Session Controller
// =========================================================================
.controller('interviewSessionCtrl', ['$timeout', '$state' ,'$scope', '$rootScope', '$http', 'sessionService', function($timeout, $state, $scope, $rootScope, $http, sessionService) {
    $scope.init = function() {
        $scope.thisInterview      = $rootScope.currentInterview;
        if (!$scope.thisInterview){
            $state.go('student-home');
            return {};
        }

        $scope.answers            = {};
        $scope.isPractice         = $scope.thisInterview.practice == 1;
        $scope.errors             = [];
        $scope.countdownTime      = 0;
        $scope.getQuestionsError  = false;
        $scope.questionIndex      = 0;
        $scope.finishedQuestions  = false;
        $scope.startCountdownTime = 0;
        $scope.countdownLength    = 3; // in seconds
        $scope.countdownString    = "00:00";
        $scope.doingCountdown     = false;
        $scope.downloadUrl        = "";


        $scope.states = {
            start     : buildState({name: "start",     nextState: 'countdown'}),                                                // state: START
            error     : buildState({name: "error",     nextState: 'error'    }),                                                // state: ERROR
            countdown : buildState({name: "countdown", nextState: 'recording', transitionDelay: 30, startBehavior: function(){  // state: COUNTDOWN
                $scope.startCountdownTime = Date.now();
                $scope.doingCountdown = true;
                updateCountdown();
            }, endBehavior: function(){
                $scope.countdownLength = $scope.thisInterview.time_limit * 60;
            }
            }),
            recording : buildState({name: "recording", nextState: 'submitting', transitionDelay: 30, startBehavior: function(){ // state: RECORDING

                $scope.doingCountdown = false;
                $timeout(startWebcamPreview, 1);


                $http.post('getQuestions', {interview_id: $scope.thisInterview.interview_id,
                    'session_id': sessionService.get('session_id'), 'uid': sessionService.get('uid')})
                    .then(function successCallback(response) {
                        $scope.questions = response.data;

                        $scope.questions.forEach(function(element){
                            $scope.answers[element.question_id] = "";
                        });

                        $scope.doingCountdown = true;
                        $scope.startCountdownTime = Date.now();
                        updateCountdown();

                        $timeout(
                            function(){
                                initializeRecorders();
                                startRecording();
                            }, 10);

                    }, function errorCallback() {
                        $scope.errors.push($scope.errors.length + '' + "There was an error retrieving interview questions from the server");
                        $scope.currentState.set($scope.states.error);
                });

            }, endBehavior: function(){
                $timeout(function(){
                    stopRecording();
                    saveAnswerAreaContents();
                }, 1);
            }}),
            submitting: buildState({name: "submitting", nextState: 'complete', startBehavior: function(){                       // state: SUBMITTING
                $scope.doingCountdown = false;

                submitAnswers();
            }}),
            complete  : buildState({name: "complete"  , nextState: 'error', startBehavior: function(){                          // state: COMPLETE
                $scope.doingCountdown = false;

                var fileName = sessionService.get('uname') + '_' + 'Interview' + $scope.thisInterview.interview_id + ".mpeg";
                downloadUrl(fileName,$scope.downloadUrl, 'blob', cleanupServer);
            }})
        };

        $scope.chunkStatus = {
            video: {
                successfulUploadCount :  0,
                pendingUploadCount    :  0,
                recordedChunkCount    :  0,
                totalChunkCount       : -1
            },
            audio: {
                successfulUploadCount :  0,
                pendingUploadCount    :  0,
                recordedChunkCount    :  0,
                totalChunkCount       : -1
            },
            failedUploadAttempts      : 0
        };


        $scope.currentState = $scope.states.start;
        $scope.advanceState();

    };

    function updateCountdown (){
        if(!$scope.doingCountdown)
            return;

        $scope.countdownTime = $scope.countdownLength - Math.floor((Date.now() - $scope.startCountdownTime) / 1000);

        $scope.countdownString = buildTimeString($scope.countdownTime);
        if($scope.countdownTime > 0){
            $timeout(updateCountdown, 250);
        } else {
            $scope.advanceState();
        }
    }

    function buildTimeString (timeInSeconds) {
        var seconds = timeInSeconds % 60;
        var minutes = Math.floor((timeInSeconds / 60)) % 60;

        seconds = (seconds > 9) ? seconds : '0' + seconds;
        minutes = (minutes > 9) ? minutes : '0' + minutes;

        return minutes + ":" + seconds;
    }

    $scope.advanceState = function(){
        $scope.currentState.next();
    };

    function buildState(params){
        var newObject = {
            name: params.name,
            set:  function(newState){

                if($scope.currentState.end)
                    $scope.currentState.end();

                $timeout(function(){
                    $scope.currentState = newState;
                    console.log("Interview Session Controller State: " + $scope.currentState.name);

                    if($scope.currentState.start) {
                        $scope.currentState.start();
                    }
                }, $scope.currentState.delay);

            },
            equals: function(thatState){ return this.name == thatState.name;},
            next: function() {
                $scope.currentState.set($scope.states[params.nextState]);
            }
        };
        newObject.start = params.startBehavior;
        newObject.end   = params.endBehavior;
        newObject.delay = (params.transitionDelay > 0) ? params.transitionDelay : 1;
        return newObject;
    }


    function startWebcamPreview() {
        var videoElement = document.getElementById('interviewRecording');
        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                width:  {min: 300, ideal: 300, max: 300},
                height: {min: 300, ideal: 300, max: 300}
            }
        })
        .then(function (stream) {
            videoElement.src = URL.createObjectURL(stream);
            videoElement.play();
        });
    }

    function initializeRecorders() {
        $scope.audioRecorder =  new AudioRecorder({
            finishRecordCallback   : saveAudio,
            analyzerRenderCallback : renderAnalyzer,
            bitRate                : 256,
            bufferSize             : 4096,
            chunkLength            : 60, // In seconds
            timeout                : $timeout
        });

        $scope.domRecorder = new DomRecorder({
            finishRecordCallback : saveVideo,
            element              : document.getElementById('elementToShare'),
            frameRate            : 30, // Frames per second
            chunkLength          : 60  // In seconds
        });
    }

    function saveVideo(videoBlob, id, isLastChunk) {
        $scope.chunkStatus.video.recordedChunkCount ++;
        if(isLastChunk) {
            $scope.chunkStatus.video.totalChunkCount = id + 1;
        }
        uploadChunk(id, 'video', videoBlob);
    }

    function saveAudio(audioBlob, id, isLastChunk) {
        $scope.chunkStatus.audio.recordedChunkCount ++;
        if(isLastChunk) {
            $scope.chunkStatus.audio.totalChunkCount = id + 1;
        }
        uploadChunk(id, 'audio', audioBlob);
    }

    function mergeChunks(){
        $http.post('mergeSubmissionChunks', {uname: sessionService.get('uname'), interview_id: $scope.thisInterview.interview_id,
                session_id: sessionService.get('session_id'), uid: sessionService.get('uid')}).then(function successCallback(response) {

            $scope.downloadUrl = response.data;
            $scope.advanceState();
        }, function errorCallback(response){
            $scope.errors.push($scope.errors.length + '' + " There was a problem merging chunks on the server.");
            $scope.currentState.set($scope.states.error);
            console.error(response.data);
        });
    }

    function cleanupServer(){
        $http.post('deleteTemporaryFile',  {uname: sessionService.get('uname'), interview_id: $scope.thisInterview.interview_id,
            session_id: sessionService.get('session_id'), uid: sessionService.get('uid')});
    }

    function uploadChunk(chunkId, mediaType, blob){
        $scope.chunkStatus[mediaType].pendingUploadCount ++;

        var formData = new FormData();
        formData.append('uname'       , sessionService.get('uname'));
        formData.append('interview_id', $scope.thisInterview.interview_id);
        formData.append('blob'        , blob);
        formData.append('mediaType'   , mediaType);
        formData.append('chunkId'     , chunkId);
        formData.append('session_id'  , sessionService.get('session_id'));
        formData.append('uid'         , sessionService.get('uid'));

        $http.post('storeSubmissionChunk', formData, {
            transformRequest: angular.identity,
            headers         : {'Content-Type': undefined}//,
        }).then(function successCallback(response) {
            var videoChunksStatus = $scope.chunkStatus.video;
            var audioChunksStatus = $scope.chunkStatus.audio;

            $scope.chunkStatus[mediaType].successfulUploadCount ++;
            $scope.chunkStatus[mediaType].pendingUploadCount --;

            // If this was our last chunk to be uploaded tell the server to merge the pieces and send a copy back
            if(videoChunksStatus.successfulUploadCount == videoChunksStatus.totalChunkCount && audioChunksStatus.successfulUploadCount == audioChunksStatus.totalChunkCount) {
                mergeChunks();
            }
        }, function errorCallback() {
            // Keep trying to upload this chunk until we have failed 20 times, then go to the error state
            if(++$scope.chunkStatus.failedUploadAttempts > 20){
                $scope.errors.push($scope.errors.length + '' + " There was a problem uploading chunks to the server.");
                $scope.currentState.set($scope.states.error);
            }
            else
                uploadChunk(chunkId, mediaType, blob);
        });

    }

    // TODO: This is where the microphone level bars can be tied in
    function renderAnalyzer(time, analyzer) {
        //console.log("---- render analyzer ----");
        //console.log(time);
        //console.log(analyzer);
    }

    function startRecording() {
        $scope.audioRecorder.start();
        $scope.domRecorder.start();

    }

    function stopRecording() {
        $scope.audioRecorder.stop();
        $scope.domRecorder.stop();
    }

    $scope.previousQuestion = function(){
        if($scope.questionIndex == 0)
            return;

        saveAnswerAreaContents();
        --$scope.questionIndex;
        restoreAnswerAreaContents();
    };

    $scope.nextQuestion = function() {
        if($scope.questionIndex >= $scope.questions.length - 1)
            return;

        saveAnswerAreaContents();
        ++$scope.questionIndex;
        restoreAnswerAreaContents();
    };

    function restoreAnswerAreaContents(){
        if($scope.questions.length == 0)
            return;
        var answerElement = document.getElementById("answerArea");

        // Store the answer to the current question
        var thisQuestionId = $scope.questions[$scope.questionIndex].question_id;
        answerElement.innerHTML = ($scope.answers[thisQuestionId]) ? $scope.answers[thisQuestionId] : "";
    }

    function saveAnswerAreaContents(){
        if($scope.questions.length == 0)
            return;

        var answerElement = document.getElementById("answerArea");

        // Store the answer to the current question
        var thisQuestionId = $scope.questions[$scope.questionIndex].question_id;
        $scope.answers[thisQuestionId] = answerElement.innerHTML;
    }


    function submitAnswers() {
        $scope.doingCountdown = false;

        if(!$scope.isPractice) {
            $http.post('storeAnswers', {
                uname: sessionService.get('uname'),
                answers: $scope.answers,
                interview_id: $scope.thisInterview.interview_id,
                session_id: sessionService.get('session_id'),
                uid: sessionService.get('uid')
            }).then(function successCallback() {
                    console.log("Successfully Submitted answers");
                }, function errorCallback(response) {
                    $scope.errors.push($scope.errors.length + ' ' + response.data);
                }
            );
        }
    }

}]);


