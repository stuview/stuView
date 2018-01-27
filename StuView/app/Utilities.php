<?php
namespace App;


class Utilities
{
    public static function runCommand($command, $commandPath) {
        $descriptorSpec = array(
            0 => array('pipe', 'r'),
            1 => array('pipe', 'w'),
            2 => array('pipe', 'w')
        );

        $process  = proc_open($command, $descriptorSpec, $pipes, dirname($commandPath), null);

        $stdout = stream_get_contents($pipes[1]);
        fclose($pipes[1]);

        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[2]);

        $exitStatus = proc_close($process);

        $result = array(
            'stdout' => $stdout,
            'stderr' => $stderr,
            'exitStatus' => $exitStatus
        );

        return $result;
    }
}