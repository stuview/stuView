<?php
namespace App\Http\Controllers;

use App\Assessment;
use App\Assignment;
use App\Enrollment;
use App\Http\Controllers\Auth\AuthController;
use App\InstructorNotification;
use App\Interview;
use App\Question;
use App\Response;
use App\Rubric;
use App\Criteria;
use App\Student;
use App\StudentNotification;
use App\Submission;
use Illuminate\Http\Request;
use App\User;
use App\Http\Controllers\Controller;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Storage;
use Mockery\CountValidator\Exception;

class NotificationsController extends Controller
{
    public function getNotifications(Request $request)
    {
		if(AuthController::checkSession($request)) {
			$this->validate($request, ['user_type' => 'required|in:student,instructor', 'uname' => 'required']);
			try
			{
				if($request->input('user_type') == 'student')
				{
					$student_id = Student::where('student_uname', $request->input('uname'))->value('student_id');
					$notifications = StudentNotification::where('student_id', $student_id)->get();
				}
				else
				{
					$instructor_id = Student::where('faculty_uname', $request->input('uname'))->value('assessor_id');
					$notifications = InstructorNotification::where('instructor_id', $instructor_id)->get();
				}
				return $notifications;
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

    public function getInstructorNotifications(Request $request)
    {
		if(AuthController::checkSession($request)) {
			$this->validate($request, ['instructor_id' => 'required|integer']);
			try
			{
				$notifications = InstructorNotification::where('instructor_id', $request->input('instructor_id'))->get();
				return $notifications;
			}
			catch(\PDOException $e)
			{
				$code = $e->getCode();
				if($code == '2002')
				{
					return "Connection Error";
				}
			}
		}
		else {
			return response("Unauthorized attempt", 401);
		}
    }

    public function deleteNotification(Request $request)
    {
		if(AuthController::checkSession($request)) {
			$this->validate($request, ['user_type' => 'required|in:student, instructor', 'notification_id' => 'required|integer']);
			try
			{
				if($request->input('user_type') == 'student')
				{
					StudentNotification::where('notification_id', $request->input('notification_id'))->delete();
				}
				else
				{
					InstructorNotification::where('notification_id', $request->input('notification_id'))->delete();
				}
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

    public function deleteNotifications(Request $request)
    {
		if(AuthController::checkSession($request)) {
			$this->validate($request, ['user_type' => 'required|in:student, instructor', 'uname' => 'required']);
			try
			{
				if($request->input('user_type') == 'student')
				{
					$student_id = Student::where('student_uname', $request->input('uname'))->value('student_id');
					StudentNotification::where('student_id', $student_id)->delete();
				}
				else
				{
					$instructor_id = Instructor::where('faculty_uname', $request->input('uname'))->value('assessor_id');
					InstructorNotification::where('instructor_id', $instructor_id)->delete();
				}
				return response();
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
}