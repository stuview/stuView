<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class IndustryAssessor extends Model
{
    protected $fillable = ["fname", "lname", "company_id"];

    protected $table = 'industry_assessors';

    public $timestamps = false;
}