<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    protected $fillable = ['interview_id', 'student_id', 'answer_media'];

    public $timestamps = false;
}