<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    protected $fillable = ['interview_id', 'student_id', 'instructor_id', 'due_data'];

    public $timestamps = false;
}