<?php
namespace App\Http\Controllers;

use App\Company;
use App\Faculty;
use App\Http\Controllers\Auth\AuthController;
use App\IndustryAssessor;
use Illuminate\Http\Request;
use App\User;
use App\Http\Controllers\Controller;
use Illuminate\Pagination\Paginator;
use Mockery\CountValidator\Exception;

class AssessorController extends Controller
{
	public function getInstructor(Request $request)
	{
		if(AuthController::checkSession($request)) {
			$this->validate($request, ['faculty_uname' => 'required']);
			try
			{
				$faculty = Faculty::select('faculty_uname', 'fname', 'lname')
						->where('faculty_uname', $request->input('faculty_uname'))
						->first();
			}
			catch(\PDOException $e)
			{
				return response($e->getMessage(), 500);
			}

			if(empty($faculty)) {
				return response("Invalid user", 400);
			}

			return $faculty;
		}
		else {
			return response("Unauthorized attempt", 401);
		}
	}

    public function getIndustryAssessor(Request $request)
    {
		if(AuthController::checkSession($request)) {
			$this->validate($request, ['assessor_id' => 'required|integer']);
			try {
				$assessor = IndustryAssessor::where('assessor_id', $request->input('assessor_id'))->first();
				$company = Company::where('company_id', $assessor->company_id)->first();
				$assessorCollection = collect($assessor);
				$companyCollection = collect($company);
				$returnValues = $assessorCollection->merge($companyCollection);
			} catch (\PDOException $e) {
				return response($e->getMessage(), 500);
			}

			if(empty($returnValues)) {
				return response("Error: malformed request", 400);
			}

			return $returnValues;
		}
		else {
			
			return response("Unauthorized attempt", 401);
		}
    }

    public function storeInstructor(Request $request)
    {
		if(AuthController::checkSession($request)) {
			$this->validate($request, ['faculty_uname' => 'required', 'fname' => 'required', 'lname' => 'required']);
			try {
				$test = Faculty::where('faculty_uname', $request->input("faculty_uname"))->first();
				if ($test != null) {
					return $test;
				}
				$values = $request->all();
				$faculty = Faculty::create($values);
				return $faculty;
			} catch (\PDOException $e) {
				
				return response($e->getMessage(), 500);
			}
		}
		else {
			
			return response("Unauthorized attempt", 401);
		}
    }

    public function storeIndustryAssessor(Request $request)
    {
		if(AuthController::checkSession($request)) {
		    $this->validate($request, ['fname' => 'required', 'lname' => 'required', 'company_name' => 'required']);
		    $name = $request->only(['company_name']);
		    try {
			    $company = Company::firstOrCreate($name);
			    $test = IndustryAssessor::where('fname', $request->input('fname'))->where('lname', '=', $request->input('lname'))->first();
			    if ($test != null) {
				    return response("User already exists", 400);
			    }
			    $industryAssessor = new IndustryAssessor;
			    $industryAssessor->fname = $request->fname;
			    $industryAssessor->lname = $request->lname;
			    $industryAssessor->company_id = $company->company_id;
			    $industryAssessor->save();
		    } catch (\PDOException $e) {
			    
			    return response($e->getMessage(), 500);
		    }
		    return response();
		}
    }
}