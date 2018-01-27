<?php
namespace App\Http\Controllers;

use App\Assignment;
use App\Enrollment;
use App\Http\Controllers\Auth\AuthController;
use App\Interview;
use App\Question;
use App\Answer;
use App\Rubric;
use App\Criteria;
use App\Student;
use App\Faculty;
use App\StudentNotification;
use App\Submission;
use Illuminate\Http\Request;
use App\User;
use App\Http\Controllers\Controller;
use App\Classes;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Mockery\CountValidator\Exception;

class ProblemController extends Controller
{
    public function getInterview(Request $request)
    {
		if(AuthController::checkSession($request)) {
			$this->validate($request, ['interview_id' => 'required|integer']);
			try
			{
				$interview = Interview::where('interview_id', $request->input('interview_id'))->first();
				return $interview;
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
		}
		else {
			return response("Unauthorized attempt", 401);
		}
    }

    public function getQuestions(Request $request)
    {
		if(AuthController::checkSession($request)) {
			$this->validate($request, ['interview_id' => 'required|integer']);
			try
			{
				$questions = Question::where('interview_id', $request->input('interview_id'))->get();
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
			return $questions;
		}
		else {
			return response("Unauthorized attempt", 401);
		}
    }

    public function getInterviews(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			try
			{
				$interviews = Interview::all();

				// need to prune all instructor_id's from the results and replace with usernames
				foreach($interviews as $interview) {
					$instructor_uname = Faculty::where('assessor_id', $interview->instructor_id)
							->value('faculty_uname');

					unset($interview['instructor_id']);
					$interview['instructor_uname'] = $instructor_uname;
				}
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
			return $interviews;
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function getRubric(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['question_id' => 'required|integer']);
			try
			{
				$rubric = Rubric::where('question_id', $request->input('question_id'))->first();
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
			return $rubric;
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function getCriteria(Request $request)
    {

    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['rubric_id' => 'required|integer']);
			try
			{
				$criteria = Criteria::where('rubric_id', $request->input('rubric_id'))->get();
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
			return $criteria;
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function getAssignments(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['student_uname' => 'required']);
			try
			{
				$sid = Student::where('student_uname', $request->input('student_uname'))->value('student_id');
				$assignments = Assignment::where('student_id', $sid)->
				where('completed', '=', 0)->
				join('interviews', 'assignments.interview_id', '=', 'interviews.interview_id')->get();
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
			return $assignments;
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function getAssignedStudents(Request $request) {
		if(AuthController::checkSession($request)) {
			$this->validate($request, ['interview_id' => 'required|integer']);

			try
			{
				$assignments = Assignment::select('students.student_uname', 'lname', 'fname')->where('interview_id',
						$request->input('interview_id'))->join('students', 'assignments.student_id', '=',
						'students.student_id')->get();
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
			return $assignments;
		}
		else {
			return response("Unauthorized attempt", 401);
		}
    }

    public function getAssignedGroups(Request $request){
        // TODO: Make this more efficient, the nested for loop makes me cringe (and it's my code).  Maybe take care of this all in a stored procedure?
        //       Michael Peterson 01/05/2016

	    if(AuthController::checkSession($request)) {
		    $this->validate($request, ['interview_id' => 'required|integer']);
		    try
		    {
			    // our result
			    $qualifyingGroups = [];

			    // Get the students who are assigned to this interview
			    $assignedStudents = Assignment::select('student_id')->where('interview_id', '=', $request->input('interview_id'))->get();
			    if(count($assignedStudents) == 0)
				    return [];

			    // Extract just the student id's from the previous list
			    $assignedStudentIds = [];
			    foreach($assignedStudents as $thisAssignedStudent)
				    array_push($assignedStudentIds, $thisAssignedStudent->student_id);

			    // All of the group ids
			    $allGroups = Classes::select('class_id', 'group_title')->get();

			    foreach($allGroups as $thisGroup)
			    {
				    $haveAllMembers = true;

				    // Get the students who are in this group
				    $theseGroupMembers = Enrollment::select('student_id')->where('class_id', '=', $thisGroup->class_id )->get();
				    if(count($theseGroupMembers) == 0)
					    continue;

				    // Find out if this group has all of it's members assigned to this interview
				    foreach($theseGroupMembers as $thisGroupMember)
				    {
					    // If this group member isn't assigned then there is no point in searching the rest of the members, we already know
					    // the group hasn't been assigned in it's entirety.
					    if(!in_array($thisGroupMember->student_id, $assignedStudentIds))
					    {
						    $haveAllMembers = false;
						    break;
					    }
				    }

				    if($haveAllMembers)
					    array_push($qualifyingGroups, $thisGroup);
			    }
			    return $qualifyingGroups;
		    }
		    catch(\PDOException $e)
		    {
			    return response($e->getMessage(), 500);
		    }
		    return response('');
	    }
	    else {
	    	return response("Unauthorized attempt", 401);
	    }
    }

    public function storeInterview(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['title' => 'required', 'description' => 'required',
					'time_limit' => 'required|integer', 'uname' => 'required', 'practice' => 'required|integer']);
			try
			{
				$interviewData = $request->except(['uname']);
				$instructorId = Faculty::where('faculty_uname', $request->input('uname'))->value('assessor_id');
				$interviewData['instructor_id'] = $instructorId;

				$test = Interview::where('title', $request->input('title'))->first();
				if($test != null)
				{
					return response("Duplicate interview", 409);
				}
				$interview = Interview::create($interviewData);
				return $interview;
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function updateInterview(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['title' => 'required','description' => 'required', 'interview_id' => 'required|integer',
					'time_limit' => 'required|integer|min:1', 'instructor_uname' => 'required']);
			try
			{
				$instructor_id = Faculty::where('faculty_uname', $request->input('instructor_uname'))
						->value('assessor_id');

				$interview = Interview::where('interview_id', $request->input('interview_id'))
						->where('instructor_id', $instructor_id)
						->get();
				/*Interview::where('interview_id', $request->input('interview_id'))->
				where('instructor_id', '=', $request->input('instructor_id'))->first();*/
				if($interview == null)
				{
					return response("Interview does not exist", 409);
				}
				Interview::where('interview_id', $request->input('interview_id'))->update(['title' => $request->input('title'),
						'description' => $request->input('description'), 'time_limit' => $request->input('time_limit')]);
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function deleteInterview(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['interview_id' => 'required|integer', 'uname' => 'required']);
			try
			{
				$instructor_id = Faculty::where('faculty_uname', $request->input('uname'))->value('assessor_id');

				$interview = Interview::where('instructor_id', $instructor_id)
						->where('interview_id', $request->input('interview_id'))
						->first();
				if($interview == null)
				{
					return response("Interview does not exist", 409);
				}

				$qids = Question::where('interview_id', $interview->interview_id)->pluck('question_id');
				$rids = Rubric::whereIn('question_id', $qids)->pluck('rubric_id');
				Criteria::whereIn('rubric_id', $rids)->delete();
				Rubric::whereIn('question_id', $qids)->delete();
				Question::where('interview_id', $interview->interview_id)->delete();
				Interview::where('interview_id', $request->input('interview_id'))->delete();

				return response('');
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function storeQuestion(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['interview_id' => 'required|integer', 'criteria' => 'required',
					'question' => 'required']);

			$questionData = $request->only('interview_id', 'question');
			try
			{
				$test = Question::where('interview_id', $request->input('interview_id'))
						->where('question', '=', $request->input('question'))
						->first();
				if($test != null)
				{
					return response('Duplicate question', 409);
				}
				$question = Question::create($questionData);
				$question_id = $question->id;
				$rubric = new Rubric;
				$rubric->question_id = $question_id;
				$rubric->save();
				if ($request->criteria != null)
				{
					$criteria = $request->input('criteria');

					foreach ($criteria as $insertValue)
					{
						$criteriaInsert = new Criteria;
						$criteriaInsert->rubric_id = $rubric->rubric_id;
						$criteriaInsert->criteria_description = $insertValue;
						$criteriaInsert->save();
					}
					return response('');
				}
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
			return response('');
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

	public function storeCriteria(Request $request) {
		if(AuthController::checkSession($request)) {
			$this->validate($request, ['rubric_id' => 'required|integer', 'criteria_description' => 'required']);
			try {
				$rubric = Rubric::where('rubric_id', $request->input('rubric_id'))->get();
				if($rubric == null) {
					return response('Rubric does not exist', 409);
				}

				$criteria = new Criteria;
				$criteria->rubric_id = $request->input('rubric_id');
				$criteria->criteria_description = $request->input('criteria_description');
				$criteria->save();

				return response('');
			}
			catch(\PDOException $e) {
				return response($e->getMessage(), 500);
			}
		}
		else {
			return response("Unauthorized attempt", 401);
		}
	}

    public function storeAnswers(Request $request){
        $this->validate($request, ['student_id' => 'required|integer', 'answers' => 'required|array']);
        try{
            $student_id    = $request->student_id;
            $answers       = $request->answers;

            foreach($answers as $question_id => $content){
                Answer::create(['student_id' => $student_id, 'question_id' => $question_id, 'content' => $content]);
            }

            return 'success';
        }
        catch(Exception $ex){
            return $ex->getCode();
        }
    }

    public function updateCriteria(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['criteria_description' => 'required','criteria_id' => 'required|integer']);
			try
			{
				Criteria::where('criteria_id', $request->input('criteria_id'))->
				update(['criteria_description' => $request->input('criteria_description')]);
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
			return response('');
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function deleteCriteria(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['criteria_id' => 'required|integer']);
			try
			{
				$criteria = Criteria::where('criteria_id', $request->input('criteria_id'))->first();
				$criteria->delete();
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
			return response('');
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function updateQuestion(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['question' => 'required','question_id' => 'required|integer',
					'instructor_uname' => 'required']);
//			$questionData = $request->only('question');
			try
			{
				$instructor_id = Faculty::where('faculty_uname', $request->input('instructor_uname'))
						->value('assessor_id');

				$test = Question::where('question_id', $request->input('question_id'))->first();
				if($test != null)
				{
					$interview = Interview::where('interview_id', $test->interview_id)
							->where('instructor_id', '=', $instructor_id)
							->first();
					if($interview == null)
					{
						var_dump($instructor_id, $test, $interview);
						return response('Interview does not exist', 409);
					}
					if($test->question == $request->input('question'))
					{
					return response('Question already exists, no update executed');
					}
					Question::where('question_id', $request->input('question_id'))
							->update(['question' => $request->input('question')]);
					return response('');
				}
				return response('Question does not exist', 409);
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
    		}
		else {
			return response("Unauthorized attempt", 401);
		}
    }

    public function deleteQuestion(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['question_id' => 'required|integer', 'uname' => 'required']);
			try
			{
				$question = Question::where('question_id', $request->input('question_id'))->first();
				if($question != null)
				{
					$instructor_id = Faculty::where('faculty_uname', $request->input('uname'))
							->value('assessor_id');
					$interview = Interview::where('instructor_id', $instructor_id)->get();
					/*Interview::where('interview_id', $question->interview_id)->
					where('instructor_id', '=', $request->input('instructor_id'))->first();*/
					if($interview == null)
					{
						return response("Interview does not exist", 409);
					}

					$rubric = Rubric::where('question_id', $question->question_id)->first();

					if($rubric != null)
					{
						$criteria = Criteria::where('rubric_id', $rubric->rubric_id)->get();

						if($criteria != null)
						{

							foreach ($criteria as $deleteValue)
							{
								Criteria::where('criteria_id', $deleteValue->criteria_id)->delete();
							}
						}
						Rubric::where('rubric_id', $rubric->rubric_id)->delete();
					}
					if($question != null)
					{
						Question::where('question_id', $question->question_id)->delete();
					}
					Question::where('question_id', $question->question_id)->delete();
					return response('');
				}
				return response("Question does not exist", 409);
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function storeAssignment(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['interview_id' => 'required|integer', 'student_uname' => 'required',
					'due_date' => 'required|date', 'instructor_uname' => 'required']);
			$date = date( "Y-m-d", strtotime($request->input(('due_date'))));
			try
			{
				$instructor_id = Faculty::where('faculty_uname', $request->input('instructor_uname'))
						->value('assessor_id');
				$student_id = Student::where('student_uname', $request->input('student_uname'))
						->value('student_id');

				$assignment = new Assignment;
				$assignment->interview_id = $request->input('interview_id');
				$assignment->student_id = $student_id;
				$assignment->instructor_id = $instructor_id;
				$assignment->due_date = $date;
				$assignment->save();

				$interview = Interview::where('interview_id', $request->input('interview_id'))->first();
				$message = "You have been assigned to complete the ".$interview->title." interview by ".$date;
				StudentNotification::createStudentNotification($student_id, $message);
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
			return response('');
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function updateAssignmentDueDate(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['interview_id' => 'required|integer', 'student_uname' => 'required',
					'due_date' => 'required|date', 'uname' => 'required']);
			$date = date( "Y-m-d H:i:s", strtotime($request->input(('due_date'))));
			try
			{
				$student_id = Student::where('student_uname', $request->input('student_uname'))
						->value('student_id');

				$instructor_id = Faculty::where('faculty_uname', $request->input('uname'))->value('assessor_id');

				$assignment = Assignment::where('student_id', $student_id)->
				where('interview_id', '=', $request->input('interview_id'))->
				where('instructor_id', '=', $instructor_id)->first();
				if($assignment == null)
				{
					return response('Assignment does not exist', 409);
				}
				Assignment::where('student_id', $student_id)
						->where('interview_id', '=', $request->input('interview_id'))
						->update(['due_date' => $date]);
				$interview = Interview::where('interview_id', $request->input('interview_id'))->first();
				$message = "Due Date for ".$interview->title." changed to ".$date;
				StudentNotification::createStudentNotification($student_id,$message);
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
			return response('');
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function deleteAssignment(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['interview_id' => 'required|integer', 'student_uname' => 'required']);
			try
			{
				$student_id = Student::where('student_uname', $request->input('student_uname'))
						->value('student_id');

				$assignment = Assignment::where('interview_id', $request->input('interview_id'))
						->where('student_id', '=', $student_id);
				if($assignment == null) {
					return response("Interview does not exist", 409);
				}

				$assignment->delete();
				$interview = Interview::where('interview_id', $request->input('interview_id'))->first();
				$message = "Assignment to complete ".$interview->title." has been cancelled";
				StudentNotification::createStudentNotification($student_id,$message);
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}

			$student = Student::where('student_uname', $request->input('student_uname'))->first();
			$retAra = array('title' => $interview->title, 'student' => $student->fname . " " . $student->lname);

			return response(json_encode($retAra));
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function storeClassAssignment(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['interview_id' => 'required|integer', 'class_id' => 'required|integer',
					'due_date' => 'required|date', 'instructor_uname' => 'required']);
			$date = date( "Y-m-d", strtotime($request->input(('due_date'))));
			try
			{
				$instructor_id = Faculty::where('faculty_uname', $request->input('instructor_uname'))
						->value('assessor_id');

				$classRoster = Enrollment::where('class_id', $request->input('class_id'))->get();
				foreach($classRoster as $student)
				{
					try
					{
						$assignment = new Assignment();
						$assignment->interview_id = $request->input('interview_id');
						$assignment->student_id = $student->student_id;
						$assignment->due_date = $date;
						$assignment->instructor_id = $instructor_id;
						$assignment->save();
						$interview = Interview::where('interview_id', $request->input('interview_id'))->first();
						$message = "You have been assigned to complete the ".$interview->title." interview by ".$date;
						StudentNotification::createStudentNotification($student->student_id,$message);
					}
					catch(\PDOException $e)
					{
						return response($e->getMessage(), 500);
					}
				}

			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
			return response(Classes::where('class_id', $request->input('class_id'))->value('group_title'));
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function removeClassAssignment(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['interview_id' => 'required|integer', 'class_id' => 'required|integer']);

			try
			{
				$classRoster = Enrollment::where('class_id', '=', $request->input('class_id'))->get();
				foreach($classRoster as $thisStudent)
					Assignment::where('student_id', $thisStudent->student_id)
							->where('interview_id', $request->interview_id)
							->delete();
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}

			$retAra = array('group' => Classes::where('class_id', $request->input('class_id'))->value('group_title'),
						'title' => Interview::where('interview_id', $request->input('interview_id'))->value('title'));

			return response(json_encode($retAra));
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }


    public function updateClassAssignmentDueDate(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['interview_id' => 'required|integer', 'class_id' => 'required|integer',
					'due_date' => 'required|date']);
			$date = date( "Y-m-d H:i:s", strtotime($request->input(('due_date'))));
			try
			{
				$classRoster = Enrollment::where('class_id', $request->input('class_id'))->get();
				foreach($classRoster as $student)
				{
					try
					{
						Assignment::where('interview_id', $request->input('interview_id'))->
						Where('student_id', '=', $student->student_id)->
						update(['due_date' => $date]);
						$interview = Interview::where('interview_id', $request->input('interview_id'))->first();
						$message = "Due Date for ".$interview->title." changed to ".$date;
						StudentNotification::createStudentNotification($student->student_id,$message);
					}
					catch(\PDOException $e)
					{
						return response($e->getMessage(), 500);
					}
				}

			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
			return response('');
    		}
    		else {
    			return response("Unauthorized attempt", 401);
		}
    }

    public function deleteClassAssignment(Request $request)
    {
    		if(AuthController::checkSession($request)) {
			$this->validate($request, ['interview_id' => 'required|integer', 'class_id' => 'required|integer']);
			try
			{
				$classRoster = Enrollment::where('class_id', $request->input('class_id'))->get();
				foreach($classRoster as $student)
				{
					try
					{
						$student_id = $student->student_id;
						$assignment = Assignment::where('interview_id', $request->input('interview_id'))->where('student_id', '=', $student_id);
						$assignment->save();
						$interview = Interview::where('interview_id', $request->input('interview_id'))->first();
						$message = "Assignment to compete ".$interview->title." has been cancelled";
						StudentNotification::createStudentNotification($student->student_id,$message);
					}
					catch(\PDOException $e)
					{
						return response($e->getMessage(), 500);
					}
				}

			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}
			return response('');
		}
		else {
    			return response("Unauthorized attempt", 401);
		}
    }
}
