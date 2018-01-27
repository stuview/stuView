<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Criteria extends Model
{
    protected $table = 'criteria';

    public $timestamps = false;

    protected $primaryKey = 'criteria_id';
}