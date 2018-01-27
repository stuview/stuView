<?php
namespace App\Http\Controllers;

use App\Company;
use App\Criteria;
use App\Faculty;
use App\IndustryAssessor;
use App\Major;
use App\Interview;
use App\Rubric;
use App\Student;
use App\User;
use App\Http\Controllers\Controller;
use Illuminate\Pagination\Paginator;
use Mockery\CountValidator\Exception;

class WelcomeController extends Controller
{
    public function index()
    {
        return view('redirect');
    }

    public function test()
    {
        return view('test');
    }
    
    public function youtube()
    {
        return view('youtube');
    }
}

