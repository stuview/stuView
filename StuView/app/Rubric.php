<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Rubric extends Model
{
    protected $fillable = ["question_id", "pdf_rubric"];

    protected $table = 'rubric';

    public $timestamps = false;

    protected $primaryKey = "rubric_id";
}