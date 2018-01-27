<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class InstructorNotification extends Model
{
    protected $fillable = ['instructor_id', 'notification'];

    public $timestamps = false;

    protected $table = 'instructor_notifications';

    public static function createInstructorNotification($instructor_id, $message)
    {
        $notification = new InstructorNotification;
        $notification->instructor_id = $instructor_id;
        $notification->notification = $message;
        $notification->save();
    }
}