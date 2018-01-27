<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = ["student_uname", "fname", "lname"];

    public $timestamps = false;
}