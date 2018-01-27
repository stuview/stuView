<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Classes extends Model
{
    protected $fillable = ['group_title'];

    public $timestamps = false;

    protected $table = 'classes';

    protected $primaryKey = "class_id";
}