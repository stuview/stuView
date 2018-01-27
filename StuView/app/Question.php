<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = ['interview_id', 'question', 'time_limit'];

    public $timestamps = false;
}