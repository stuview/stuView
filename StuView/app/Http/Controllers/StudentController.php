<?php
namespace App\Http\Controllers;

use App\Assignment;
use App\Classes;
use App\Enrollment;
use App\Major;
use App\Student;
use App\StudentNotification;
use Illuminate\Http\Request;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Auth;
use phpDocumentor\Reflection\DocBlock\Tag\SeeTag;

class StudentController extends Controller
{

    public function getStudent(Request $request)
    {
		if(AuthController::checkSession($request)) {

			$this->validate($request, ['student_uname' => 'required']);
			try
			{
				$student = Student::select('student_uname', 'fname', 'lname')
						->where('student_uname', $request->input('student_uname'))
						->first();

				if(empty($student)) {
					return response("Invalid user", 400);
				}

				return $student;
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

    public function getStudents(Request $request)
    {
		if(AuthController::checkSession($request)) {
			try
			   {
				   $students = Student::all();

				   foreach($students as $s) {
					   unset($s['student_id']);
				   }
			   }
			   catch(\PDOException $e)
			   {
				   return response($e->getMessage(), 500);
			   }

			   return $students;
		}
		else {
			return response("Unauthorized attempt.", 401);
		}
    }

    public function getClassStudents(Request $request)
    {
		if(AuthController::checkSession($request)) {
			$this->validate($request, ['class_id' => 'required|integer']);

			try {
				$students = Enrollment::where('class_id', $request->input('class_id'))->join('students', 'enrollments.student_id',
					   '=', 'students.student_id')->get();
				return $students;
			} catch (\PDOException $e) {
				return response($e->getMessage(), 500);
			}
		}
		else {
			return response("Unauthorized attempt.", 401);
		}
    }

    public function getStudentEnrollment(Request $request)
    {
	    if(AuthController::checkSession($request)) {
		    $this->validate($request, ['student_uname' => 'required', 'class_id' => 'required|integer']);

		    try {
			    $student_id = Student::where('student_uname', $request->input('student_uname'))->value('student_id');

			    $student = Enrollment::where('class_id', '=', $request->input('class_id'))->where('student_id', '=',
					    $student_id)->get();
			    return $student;
		    } catch (\PDOException $e) {
			    return response($e->getMessage(), 500);
		    }
	    }
	    else {
	    	return response("Unauthorized attempt.", 401);
	    }
    }

    public function getClasses(Request $request)
    {
		if(AuthController::checkSession($request)) {
			try
			{
				$classes = Classes::orderBy('group_title', 'asc')->get();
				return $classes;
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

    public function storeStudent(Request $request)
    {
		if(AuthController::checkSession($request)) {
		    $this->validate($request, ['student_uname' => 'required', 'fname' => 'required', 'lname' => 'required',]);
		    try {
			    $student = Student::where('student_uname', $request->input('student_uname'))->first();
			    if ($student != null) {
				    return $student;
			    }
			    $d = strtotime("+12 Months");
			    $date = date("Y-m-d", $d);
			    $values = $request->all();
			    $student = Student::create($values);

			    $assignment1 = new Assignment();
			    $assignment1->student_id = $student->id;
			    $assignment1->instructor_id = 0;
			    $assignment1->interview_id = 0;
			    $assignment1->due_date = $date;
			    $assignment1->save();
			    $assignment2 = new Assignment();
			    $assignment2->student_id = $student->id;
			    $assignment2->instructor_id = 0;
			    $assignment2->interview_id = 1;
			    $assignment2->due_date = $date;
			    $assignment2->save();

			    return $student;
		    } catch (\PDOException $e) {
			    return response($e->getMessage(), 500);
		    }
		}
		else {
			return response("Unauthorized attempt.", 401);
		}
    }

    public function updateStudent(Request $request)
    {
	    if(AuthController::checkSession($request)) {
		    $this->validate($request, ['student_uname' => 'required', 'fname' => 'required', 'lname' => 'required']);

		    try {
			    $student = Student::where('student_uname', $request->input('student_uname'))->get();
			    if ($student == null) {
				    return response("Student does not exist", 500);
			    }
			    Student::where('student_id', $student->student_id)->update(['student_uname' =>
					    $request->input('student_uname'), 'fname' => $request->input('fname'), 'lname' =>
					    $request->input('lname')]);
		    } catch (\PDOException $e) {
			    return response($e->getMessage(), 500);
		    }
		    return "success";
	    }
	    else {
			return response("Unauthorized attempt.", 401);
	    }
    }

    public function storeClass(Request $request)
    {
		if(AuthController::checkSession($request)) {
			$this->validate($request, ['group_title' => 'required']);
			try {
			    $class = Classes::firstOrCreate(['group_title' => $request->input('group_title')]);
			    return $class;
			} catch (\PDOException $e) {
			    return response($e->getMessage(), 500);
			}
		}
		else {
			return response("Unauthorized attempt.", 401);
		}
    }

    public function updateClass(Request $request)
    {
		if(AuthController::checkSession($request)) {
			$this->validate($request, ['group_title' => 'required', 'class_id' => 'required|integer']);
			try {
				$class = Classes::where('group_title', $request->input('group_title'))->first();
				if ($class != null) {
					return 'Duplicate Group Title';
				}
				Classes::where('class_id', $request->input('class_id'))->update(['group_title' => $request->input('group_title')]);
			} catch (\PDOException $e) {
				return response($e->getMessage(), 500);
			}
		}
		else {
			return response("Unauthorized attempt.", 401);
		}
    }

    public function deleteClass(Request $request)
    {
		if(AuthController::checkSession($request)) {
		    $this->validate($request, ['class_id' => 'required|integer']);

		    try {
			    Classes::where('class_id', $request->input('class_id'))->delete();
			    Enrollment::where('class_id', '=', $request->input('class_id'))->delete();
			    $classes = Classes::orderBy('group_title', 'asc')->get();
			    return $classes;
		    } catch (\PDOException $e) {
			    return $e . content;
		    }
		}
		else {
			return response("Unauthorized attempt.", 401);
		}
    }

    public function enrollStudent(Request $request)
    {
		if(AuthController::checkSession($request)) {
			$this->validate($request, ['student_uname' => 'required', 'class_id' => 'required|integer']);
			try
			{
				$student_id = Student::where('student_uname', $request->input('student_uname'))->value('student_id');
				$data = $request->except('student_uname');
				$data['student_id'] = $student_id;

				Enrollment::create($data);
				$class = Classes::where('class_id', $request->input('class_id'))->first();
				$message = 'You have been enrolled in '.$class->group_title;
				StudentNotification::createStudentNotification($student_id, $message);
				$students = Enrollment::where('class_id', $request->input('class_id'))->join('students', 'enrollments.student_id',
						'=', 'students.student_id')->get();
				return $students;
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

    public function deleteEnrollment(Request $request)
    {
		if(AuthController::checkSession($request)) {
			$this->validate($request, ['student_uname' => 'required', 'class_id' => 'required|integer']);
			try {
				$student_id = Student::where('student_uname', $request->input('student_uname'))->value('student_id');

				$enrollment = Enrollment::where('student_id', $student_id)
						->where('class_id', '=', $request->input('class_id'));
				$enrollment->delete();
				$class = Classes::where('class_id', $request->input('class_id'))->first();
				$message = 'You have been unenrolled from ' . $class->group_title;
				StudentNotification::createStudentNotification($student_id, $message);
				$students = Enrollment::where('class_id', $request->input('class_id'))->join('students', 'enrollments.student_id',
						'=', 'students.student_id')->get();
				return $students;
			} catch (\PDOException $e) {
				return response($e->getMessage(), 500);
			}
		}
		else {
			return response("Unauthorized attempt.", 401);
		}
    }
}