<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Response extends Model
{
    protected $fillable = ['criteria_id', 'assessment_id', 'response_numeric', 'response_comment'];

    public $timestamps = false;
}