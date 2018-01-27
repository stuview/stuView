<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Interview extends Model
{
    protected $fillable = ['title', 'description', 'time_limit', 'instructor_id', 'practice'];

    public $timestamps = false;
}