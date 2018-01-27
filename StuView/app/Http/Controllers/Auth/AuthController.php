<?php

namespace App\Http\Controllers\Auth;

use Auth;
use App\User;
use Validator;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\ThrottlesLogins;
use Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers;
use Illuminate\Http\Request;

class AuthController extends Controller
{
	/*
	|--------------------------------------------------------------------------
	| Registration & Login Controller
	|--------------------------------------------------------------------------
	|
	| This controller handles the registration of new users, as well as the
	| authentication of existing users. By default, this controller uses
	| a simple trait to add these behaviors. Why don't you explore it?
	|
	*/

	use AuthenticatesAndRegistersUsers, ThrottlesLogins;

	/**
	* Where to redirect users after login / registration.
	*
	* @var string
	*/
	protected $redirectTo = '/home';

	/**
	* Create a new authentication controller instance.
	*
	* @return void
	*/
	public function __construct()
	{
	   $this->middleware('guest', ['except' => 'logout']);
	}

	/**
	* Get a validator for an incoming registration request.
	*
	* @param  array  $data
	* @return \Illuminate\Contracts\Validation\Validator
	*/
	protected function validator(array $data)
	{
	   return Validator::make($data, [
		  'name' => 'required|max:255',
		  'email' => 'required|email|max:255|unique:users',
		  'password' => 'required|confirmed|min:6',
	   ]);
	}

	/**
	* Create a new user instance after a valid registration.
	*
	* @param  array  $data
	* @return User
	*/
	protected function create(array $data)
	{
	   return User::create([
		  'name' => $data['name'],
		  'email' => $data['email'],
		  'password' => bcrypt($data['password']),
	   ]);
	}

	public function initSession() {
		session_start();
		$json = array();

		$json['session_id'] = $_SESSION['session_id'] = session_id();
		$json['uid'] = $_SESSION['uid'] = uniqid('stuview_');

		return response()->json($json);
	}

	public function userLogin(Request $req) {
	   session_start();

	   //$this->validate($req, ['uname' => 'required']);
	   $data = $req->all();
	   $json = array();
	   foreach($data as $key => $value) {
		  if($key != "session_id") {
			  $json[$key] = $_SESSION[$key] = $value;
		  }
	   }

	   $_SESSION['uid'] = uniqid("stuview_");
	   $json['uid'] = $_SESSION['uid'];
	   $json['session_id'] = session_id();

	   $_SESSION['LAST_ACTIVITY'] = time();

	   return response()->json($json);
	}

	public function userLogout(Request $r) {
		$data = $r->all();

		if(isset($data['session_id'], $data['uid'])) {
			session_id($data['session_id']);
			session_start();

			if(isset($_COOKIE[session_name()])) {
				setcookie(session_name(), "", time()-3600, "/");
			}

			$_SESSION = array();
			session_destroy();
		}
	}

	public function isLoggedIn(Request $r) {
	   $id = null;

	   $data = $r->all();
	   if(isset($data['session_id'])) {
		  session_id($data['session_id']);
	   }
	   session_start();

	   if(isset($data['uid'])) {
		  $id = $data['uid'];
	   }

	   return response()->json(isset($_SESSION['uid']) && $id == $_SESSION['uid']);
	}

	public static function checkSession(Request $r) {
		$data = $r->all();
		if(isset($data['session_id'])) {
		  session_id($data['session_id']);
		}
		else {
			return false;
		}
		session_start();

		if(isset($_SESSION['uid'], $data['uid'])) {
			return $_SESSION['uid'] == $data['uid'];
		}

		return false;
	}

	public static function updateSession(Request $request) {
		if(!empty($request->input('session_id'))) {
			session_id($request->input('session_id'));
			session_start();

			if(isset($_SESSION['LAST_ACTIVITY'])) {
				if((time()-$_SESSION['LAST_ACTIVITY']) <= 7200) {
					$_SESSION['LAST_ACTIVITY'] = time();
					return response();
				}
				else {
					return response("Session expired", 511);
				}
			}
			else {
				return response("Unauthorized", 403);
			}
		}
		else {
			return response("Error: malformed request.", 400);
		}
	}
}
