<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    protected $fillable = ["faculty_uname", "fname", "lname"];

    protected $table = 'faculty_assessors';

    public $timestamps = false;
}