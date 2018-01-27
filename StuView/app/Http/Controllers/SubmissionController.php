<?php
namespace App\Http\Controllers;

use App\Answer;
use App\Assessment;
use App\Assignment;
use App\Student;
use App\Enrollment;
use App\Http\Controllers\Auth\AuthController;
use App\InstructorNotification;
use App\Interview;
use App\Question;
use App\Response;
use App\Rubric;
use App\Criteria;
use App\StudentNotification;
use App\Submission;
use Illuminate\Http\Request;
use App\User;
use App\Utilities;
use App\Http\Controllers\Controller;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Storage;
use Mockery\CountValidator\Exception;

class SubmissionController extends Controller
{
    /**
     * Store a media file to the filesystem
     * @param Request $request <p>
     * The request that contains one parameter: <b>
     *    'fileName': The name of the file to be created <b>
     * </p>
     * <p> Note: $_FILES['data'] will contain the actual file being send from the client<b>
     * @return a response object that indicates the success or failure of the function
     */
    public function storeMedia(Request $request)
    {
	    $this->validate($request, ['fileName' => 'required', 'data' => 'required']);
    		if(AuthController::checkSession($request)) {
			try{
				$fileName = $request->input('fileName');
				$data     = $_FILES['data'];

				if($data == null || $fileName == null){
					return response("Error: malformed request", 500);
				}

				// TODO: Should we overwrite files that exist already? things to ponder...
				if(!file_exists("media"))
					mkdir("media");

				move_uploaded_file($data['tmp_name'], 'media/' . $fileName);
			} catch (Exception $ex){
				return response($ex.content, 500);
			}
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function getStudentSubmissions(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['student_uname' => 'required']);
			try {
				$student_id = Student::where('student_id', $request->input('student_uname'))->value('student_id');

				$submissions = Submission::where('student_id', $student_id)->get();
				return $submissions;
			} catch (\PDOException $e) {
				return response($e->getMessage(), 500);
			}
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function getInterviewSubmissions(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['interview_id' => 'required|integer']);
			try {
				$submissions = Submission::where('interview_id', $request->input('interview_id'))->
				join('students', 'submissions.student_id', '=', 'students.student_id')->
				orderBy('students.lname', 'asc')->get();
				return $submissions;
			} catch (\PDOException $e) {
				return response($e->getMessage(), 500);
			}
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function getAllSubmissions(Request $request)
    {
		if(AuthController::checkSession($request)) {
			try {
				$submissions = Submission::join('students', 'submissions.student_id', '=', 'students.student_id')->
				join('interviews', 'submissions.interview_id', '=', 'interviews.interview_id')->
				select('submissions.submission_id', 'students.fname', 'students.lname', 'interviews.title', 'submissions.answer_media')->get();
				return $submissions;
			} catch (\PDOException $e) {
				return response($e->getMessage(), 500);
			}
		}
		else {
			return response("Unauthorized attempt.", 401);
		}
    }

    public function getIndividualSubmission(Request $request)
    {
		if(AuthController::checkSession($request)) {
			$this->validate($request, ['submission_id' => 'required|integer']);
			try {
				$submissions = Submission::where('submission_id', $request->input('submission_id'))->
				join('students', 'submissions.student_id', '=', 'students.student_id')->
				join('interviews', 'submissions.interview_id', '=', 'interviews.interview_id')->
				select('submissions.submission_id', 'students.fname', 'students.lname', 'interviews.title')->get();
				return $submissions;
			} catch (\PDOException $e) {
				return response($e->getMessage(), 500);
			}
		}
		else {
			return response("Unauthorized attempt.", 401);
		}
    }

    public function sendFeedbackEmail(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['student_name' => 'required', 'assessors_email' => 'required']);
			try {
				$to = $request->input('assessors_email');
				$subject = "StuView interview submission for " . $request->input('student_name');
				$txt = "Please take a few minutes to watch " . $request->input('student_name') . "'s interview and leave feedback. Follow the link to begin. Thank you.";
				$headers = 'MIME-Version: 1.0' . "\r\n";
				$headers .= 'Content-type: text/plain' . "\r\n";
				$headers .= 'From: StuView';
				$mail = mail($to,$subject,$txt,$headers);

				if ($mail)
					return "email sent successfully";
				else
					return "email failed to send";
			} catch (\PDOException $e) {
				return response($e->getMessage(), 500);
			}
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function getClassSubmissions(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['class_id' => 'required|integer']);
			try {
				$students = Enrollment::where('class_id', $request->input('class_id'))->
				join('students', 'enrollments.student_id', '=', 'students.student_id')->
				join('submissions', 'enrollments.student_id', '=', 'submissions.student_id')->
				orderBy('students.lname', 'asc')->get();
				return $students;

			} catch (\PDOException $e) {
				return response($e->getMessage(), 500);
			}
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function  getAllGroupsForSubmissions(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			try
			{
				$groups = Submission::join('students', 'submissions.student_id', '=', 'students.student_id')->
				join('enrollments', 'enrollments.student_id', '=', 'submissions.student_id')->
				join('classes', 'classes.class_id', '=', 'enrollments.class_id')->
				select('submissions.submission_id', 'classes.group_title')->get();
				return $groups;
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
		}
		else {
    			return response("Unauthorized attempt.", 401);
		}
    }

    public function getAssessments(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['submission_id' => 'required|integer', 'rubric_id' => 'required|integer']);
			try {
				$assessments = Assessment::where('submission_id', $request->input('submission_id'))->
				where('rubric_id', '=', $request->input('rubric_id'))->
				where('released', '=', 1)->get();
				return $assessments;
			} catch (\PDOException $e) {
				return response($e->getMessage(), 500);
			}
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function getResponses(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['assessment_id' => 'required|integer']);
			try {
				$responses = Response::where('assessment_id', $request->input('assessment_id'))->
				join('criteria', 'criteria.criteria_id', '=', 'responses.criteria_id')->get();
				return $responses;
			} catch (\PDOException $e) {
				return response($e->getMessage(), 500);
			}
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    private static function buildSubmissionFilePaths($userName, $interviewId, $isPractice, $chunkNumber)
    {
        $realMediaDir     = 'media';
        $practiceMediaDir = $realMediaDir . '/practice';
        $relativeMediaDir = $isPractice ? $practiceMediaDir : $realMediaDir;
        $chunkPart        = ($chunkNumber >= 0) ? '_' . $chunkNumber : '';
        $filePrefix       = $userName . "_Interview" . $interviewId;
        $mediaDir         = $_SERVER['DOCUMENT_ROOT'] . '/' . $relativeMediaDir;
        $audioDir         = $mediaDir  . '/audio';
        $videoDir         = $mediaDir  . '/video';
        $outputDir        = $mediaDir  . '/output';
        $tempDir          = $mediaDir  . '/temp';
        $audioFilePath    = $audioDir  . '/' . $filePrefix . $chunkPart . '.mp3';
        $videoFilePath    = $videoDir  . '/' . $filePrefix . $chunkPart . '.webm';
        $outputFilePath   = $outputDir . '/' . $filePrefix . $chunkPart . '.mpeg';
        $tempFilePath     = $tempDir   . '/' . $filePrefix . $chunkPart . '.mpeg';
        $uploaderFilePath = '../scripts/js/video_upload/videoUploader.js';

        $downloadUrl      = $_SERVER['HTTP_ORIGIN'] . '/'. $relativeMediaDir . '/temp/' . $filePrefix . '.mpeg';

        //Make sure our directories exist
        if (!file_exists($_SERVER['DOCUMENT_ROOT'] . '/' . $realMediaDir))      mkdir($_SERVER['DOCUMENT_ROOT'] . '/' . $realMediaDir);
        if (!file_exists($_SERVER['DOCUMENT_ROOT'] . '/' . $practiceMediaDir))  mkdir($_SERVER['DOCUMENT_ROOT'] . '/' . $practiceMediaDir);
        if (!file_exists($audioDir))  mkdir($audioDir);
        if (!file_exists($videoDir))  mkdir($videoDir);
        if (!file_exists($outputDir)) mkdir($outputDir);
        if (!file_exists($tempDir))   mkdir($tempDir);

        return array (
            'filePrefix'        => $filePrefix,
            'mediaDir'          => $mediaDir,
            'audioDir'          => $audioDir,
            'videoDir'          => $videoDir,
            'outputDir'         => $outputDir,
            'audioFilePath'     => $audioFilePath,
            'videoFilePath'     => $videoFilePath,
            'outputFilePath'    => $outputFilePath,
            'relativeMediaDir'  => $relativeMediaDir,
            'tempFilePath'      => $tempFilePath,
            'downloadUrl'       => $downloadUrl,
            'uploaderFilePath'  => $uploaderFilePath
        );
    }

    private static function validateStudentAssignment($userName, $interviewId, $ignoreResubmission)
    {
        $result = array(
            'error'      => '',
            'doesPass'   => true,
            'isPractice' => true,
            'studentId' => -1
        );

        try {
            if($_SESSION['uname'] != $userName){
                $result['doesPass'] = false;
                $result['error'] = 'Logged in user ' . $_SESSION['uname'] . ' attempted to modify an interview for user ' . $userName;
                return $result;
            }

            $student = Student::
            select('student_id')->
                where('student_uname', '=', $userName)->
                first();

            // Make sure this student actually exists
            if ($student == null) {
                $result['error'] = "The student \"" . $userName . "\" does not exist";
                $result['doesPass'] = false;
                return $result;
            }

            $result['studentId'] = $student->student_id;

            $interview = Interview::
                where('interview_id', '=', $interviewId)->
                first();

            // Make sure this interview actually exists
            if ($interview == null) {
                $result['error'] = "Interview " . $interviewId . " does not exist";
                $result['doesPass'] = false;
                return $result;
            }

            $assignment = Assignment::
                where('student_id', '=', $result['studentId'])->
                where('interview_id', '=', $interviewId)->
                first();

            // Make sure this student is actually assigned to this interview
            if ($assignment == null) {
                $result['error'] = "The student " . $userName . " is not assigned to interview " . $interviewId;
                $result['doesPass'] = false;
                return $result;
            }

            $result['isPractice'] = $interview->practice == 1;

            // Make sure this student isn't re-submitting this interview (if it isn't a practice interview)
            if ($ignoreResubmission && !$result['isPractice'] && $assignment->completed == 1) {
                $result['error'] = "The student " . $userName . " has already taken interview " . $interviewId;
                $result['doesPass'] = false;
                return $result;
            }
        }
        catch(Exception $ex){
            $result['error'] = $ex;
            $result['doesPass'] = false;
        }

        return $result;
    }

    public function mergeSubmissionChunks(Request $request)
    {
        $this->validate($request, [
            'uname'        => 'required',
            'interview_id' => 'required|integer|min:0'
        ]);

        if(AuthController::checkSession($request)) {
            $userName = $request->input('uname');
            $interviewId = $request->input('interview_id');

            try {
                $assignmentValidation = SubmissionController::validateStudentAssignment($userName, $interviewId, false);

                if (!$assignmentValidation['doesPass'])
                    return response($assignmentValidation['error'], 500);

                $paths = SubmissionController::buildSubmissionFilePaths($userName, $interviewId, $assignmentValidation['isPractice'], -1);

                // Use a temporary filename so the vimeo script doesn't try to upload the output file before it's finished
                $tempOutputPath = $paths['outputDir'] . '/' . 'tmp' . rand(1, 32767) . rand(1, 32767) . '.mpeg';

                // Run the script that does all of the concatenating and merging
                $mergeScriptResult = Utilities::runCommand("./scripts/mergeVideo.sh -p " . $paths['filePrefix'] . " -ax mp3 -vx webm -del _ -vi " . $paths['videoDir'] . "/" . " -ai " . $paths['audioDir'] . "/" . " -o " . $tempOutputPath . ' -cleanup', $_SERVER['DOCUMENT_ROOT']);

                // Log stdout and stderr from the script
                $logFilename = $_SERVER['DOCUMENT_ROOT'] . '/../storage/logs/mergeVideo.log';
                file_put_contents($logFilename, "-------------- " . date("y-m-d H:i:s") . '  ' . $userName . ' Interview' . $interviewId . ' -------------------------------' . PHP_EOL, FILE_APPEND);
                file_put_contents($logFilename, $mergeScriptResult['stdout'], FILE_APPEND);
                file_put_contents($logFilename, $mergeScriptResult['stderr'], FILE_APPEND);

                if ($mergeScriptResult['exitStatus'] != 0)
                    return response($mergeScriptResult['stderr'], 500);


                copy($tempOutputPath, $paths['tempFilePath']);

                // rename the temporary filename back to what it should be
                rename($tempOutputPath, $paths['outputFilePath']);


                if ($assignmentValidation['isPractice']) {
                    unlink($paths['outputFilePath']);
                } else {
                    //TODO: get the output from the upload script.
                    $uploadReturn = 0;
                    $uploadResult = [];
                    exec('node ' . $paths['uploaderFilePath'] . ' ' . $paths['outputDir'], $uploadResult, $uploadReturn);
              
                    //Update the database so it shows that the interview has been taken
                    Assignment::
                    where('interview_id', '=', $interviewId)->
                    where('student_id', '=', $assignmentValidation['studentId'])->
                    update(['completed' => 1]);
                }

                return response($paths['downloadUrl'], 200);

            } catch (Exception $ex) {
                return response($ex->getMessage(), 500);
            }
        }
        else {
            return response("Unauthorized attempt", 401);
        }
    }


    public function deleteTemporaryFile(Request $request)
    {
        $this->validate($request, [
            'uname'        => 'required',
            'interview_id' => 'required|integer|min:0'
        ]);

        if(AuthController::checkSession($request)){
            try{
                $userName = $request->input('uname');
                $interviewId = $request->input('interview_id');

                $submissionValidation = SubmissionController::validateStudentAssignment($userName, $interviewId, true);
                $paths = SubmissionController::buildSubmissionFilePaths($userName, $interviewId, $submissionValidation['isPractice'], -1 );

                if(file_exists($paths['tempFilePath']))
                    unlink($paths['tempFilePath']);

                return response('success', 200);

            } catch(Exception $ex){
                return response($ex->getMessage(), 500);
            }
        }
    }

    public function storeSubmissionChunk(Request $request) {
        $this->validate($request, [
            'uname' => 'required',
            'interview_id' => 'required|integer|min:0',
            'blob' => 'required',
            'mediaType' => 'required|in:video,audio',
            'chunkId' => 'required|integer|min:0'
        ]);

        if (AuthController::checkSession($request)) {
            try {

                $userName = $request->input('uname');
                $interviewId = $request->input('interview_id');
                $blob = $_FILES['blob'];
                $mediaType = $request->input('mediaType');
                $chunkId = $request->input('chunkId');

                $assignmentValidation = SubmissionController::validateStudentAssignment($userName, $interviewId, false);

                if (!$assignmentValidation['doesPass'])
                    return response($assignmentValidation['error'], 500);

                $paths = SubmissionController::buildSubmissionFilePaths($userName, $interviewId, $assignmentValidation['isPractice'], $chunkId);

                // Store the file
                move_uploaded_file($blob['tmp_name'], $paths[$mediaType . 'FilePath']);

                return response('success', 200);
            } catch (Exception $ex) {
                return response($ex->getMessage(), 500);
            }
        }
        else {
                return response("Unauthorized attempt", 401);
        }
    }


    public function storeAssessment(Request $request)
    {
	    /**
		* Once we implement the functionality for this, we might need to redo how faculty assessors are stored,
		* so that we don't have to pass around the primary key for them
		*/
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['rubric_id' => 'required|integer', 'submission_id' => 'required|integer',
					'assessor_id' => 'required|integer', 'assessor_type' => 'required|in:faculty,industry']);
			try {
				$assessment = Assessment::where('rubric_id', $request->input('rubric_id'))->
				where('submission_id', '=', $request->input('submission_id'))->
				where('assessor_id', '=', $request->input('assessor_id'))->
				where('assessor_type', '=', $request->input('assessor_type'))->first();
				if ($assessment == null) {
					$assessmentValues = $request->all();
					$toReturn = Assessment::create($assessmentValues);
					return $toReturn;
				} else {
					return 'Duplicate Assessment';
				}
			} catch (\PDOException $e) {
				return response($e->getMessage(), 500);
			}
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function releaseAssessments(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['submission_id' => 'required|integer']);
			try {
				$assessments = Assessment::where('submission_id', $request->input('submission_id'))->get();
				foreach ($assessments as $assessment) {
					Assessment::where('submission_id', $assessment->submission_id)->update(['released' => 1]);
				}
				$submission = Submission::where('submission_id', $request->input('submission_id'))->first();
				$interview = Interview::where('interview_id', $submission->interview_id)->first();
				$message = "Feedback has been released for your submission of interview " . $interview->title;
				StudentNotification::createStudentNotification($submission->student_id, $message);
				return response('');
			} catch (\PDOException $e) {
				return response($e->getMessage(), 500);
			}
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function storeResponse(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['criteria_id' => 'required|integer', 'assessment_id' => 'required|integer',
					'response_numeric' => 'required|integer|max:100|min:1', 'response_comment' => 'required']);
			try {
				$response = Response::where('criteria_id', $request->input('criteria_id'))->
				where('assessment_id', '=', $request->input('assessment_id'))->
				where('response_numeric', '=', $request->input('response_numeric'))->
				where('response_comment', '=', $request->input('response_comment'))->first();
				if ($response == null) {
					$responseValues = $request->all();
					Response::create($responseValues);
				} else {
					return 'Duplicate Response';
				}
			} catch (\PDOException $e) {
				return response($e->getMessage(), 500);
			}
			return "success";
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function storeAnswers(Request $request){
        if(AuthController::checkSession($request)) {
            $this->validate($request, ['uname' => 'required', 'answers' => 'required|array', 'interview_id' => 'required|integer']);
            try{
                $userName    = $request->input('uname');
                $answers     = $request->input("answers");
                $interviewId = $request->input("interview_id");

                $submissionValidation = SubmissionController::validateStudentAssignment($userName, $interviewId, true);

                // Make sure this isn't a practice interview
                if($submissionValidation['isPractice'])
                    return response("An attempt was made to submit answers for a practice interview", 500);

                // Make sure this interview exists, this user is assigned to it, and they are allowed to submit
                if(!$submissionValidation['doesPass'])
                    return response($submissionValidation['error'], 500);

                // Pull out the question ids from the submitted answers
                $questionIds = array();
                foreach($answers as $question_id => $content){
                    if(is_integer($question_id))
                        array_push($questionIds, $question_id);
                }

                $questions     = Question::select('question_id', 'interview_id')->wherein('question_id', $questionIds)->get();
                $storedAnswers =   Answer::select('question_id')->wherein('question_id', $questionIds)->get();

                // Make sure all of these questions are associated with the provided interview
                foreach($questions as $thisQuestion) {
                    if($thisQuestion->interview_id != $interviewId)
                        return response("One of or more the submitted answers is not associated with the provided interview", 500);
                }

                // Make sure every answer is associated with a different question
                if(count($questions) != count($questionIds))
                    return response("There are more or fewer answers for this interview then there are questions", 500);

                // Make sure none of these answers have already been stored
                if($storedAnswers != null && count($storedAnswers) != 0)
                    return response("One or more of the submitted answers have already been stored", 500);

                // Store the answers
                foreach($answers as $question_id => $content){
                    Answer::create(['student_id' => $submissionValidation['studentId'], 'question_id' => $question_id, 'content' => $content]);
                }

                return response('success', 200);
            }
            catch(Exception $ex){
                return response($ex->getMessage(), 500);
            }
        }
        else {
            return response("Unauthorized attempt", 401);
        }
    }

    public function updateResponse(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['response_id' => 'required|integer',
					'response_numeric' => 'required|integer|max:100|min:1',
					'response_comment' => 'required']);
			try {
				Response::where('response_id', $request->input('response_id'))->update(['response_numeric' => $request->input('response_numeric'),
						'response_comment' => $request->input('response_comment')]);
			} catch (\PDOException $e) {
				return response($e->getMessage(), 500);
			}
			return "success";
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function getAllInterviewData(Request $request) {
		if(AuthController::checkSession($request)) {
			$this->validate($request, ['submission_id' => 'required|integer']);
			$result = array();

			try {
				$submission = Submission::where('submission_id', $request->input('submission_id'))->first();
				$student = Student::where('student_id', $submission->student_id)->first();
				$interview = Interview::where('interview_id', $submission->interview_id)->first();
				$questions = Question::where('interview_id', $submission->interview_id)->get();

				$result['link'] = $submission->answer_media;
				$result['fname'] = $student->fname;
				$result['lname'] = $student->lname;
				$result['title'] = $interview->title;
				$result['interview_id'] = $interview->interview_id;
				$result['questions'] = array();
				$result['answers'] = array();

				foreach($questions as $q) {
					$result['questions'][$q->question_id] = $q->question;

					$answer = Answer::where('question_id', $q->question_id)->first();
					$result['answers'][$q->question_id] = $answer->content;
				}
			}
			catch(\PDOException $e) {
				return response($e->getMessage(), 500);
			}

			return $result;
		}
		else {
			return response("Unauthorized attempt", 401);
		}
    }

	public function getQuestionCriteria(Request $request) {
		if(AuthController::checkSession($request)) {
			$this->validate($request, ['question_id' => 'required|integer']);
			$result = array();

			try {
				$rubric = Rubric::where('question_id', $request->input('question_id'))->first();
				$criteria = Criteria::where('rubric_id', $rubric->rubric_id)->get();

				foreach($criteria as $c) {
					array_push($result, $c->criteria_description);
				}
			}
			catch(\PDOException $e) {
				return response($e->getMessage(), 500);
			}

			return $result;
		}
		else {
			return response('Unauthorized attempt', 401);
		}
	}
}
