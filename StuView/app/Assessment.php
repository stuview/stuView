<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Assessment extends Model
{
    protected $fillable = ['rubric_id', 'submission_id', 'assessor_id', 'assessor_type', 'pdf_assessment', 'released'];

    public $timestamps = false;
}