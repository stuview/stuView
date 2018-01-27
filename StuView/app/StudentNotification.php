<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class StudentNotification extends Model
{
    protected $fillable = ['student_id', 'notification'];

    public $timestamps = false;

    protected $table = 'student_notifications';
    
    public static function createStudentNotification($student_id, $message)
    {
        $notification = new StudentNotification;
        $notification->student_id = $student_id;
        $notification->notification = $message;
        $notification->save();
    }
}