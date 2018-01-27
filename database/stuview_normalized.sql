/* TODO: This file is ridiculous, it contains test data that puts the db in an invalid state (students assigned to
        interviews that don't exist etc).  Instead of defining the full scheme of the tables using the CREATE TABLE
        command, the tables are created then altered after the fact (adding primary keys and redefining their attributes.
        There only appear to be primary keys, no foreign keys are used, this is part of the reason the db is allowed to
        be placed in a bad state in the first place.

        Some decisions need to be made on the schema and on how rules that should be present (like not allowing people
        to be assigned to non-existent interviews) will be enforced be it through the php controllers or through built
        in MySql mechanisms.

        Michael Peterson
        January 24, 2017
 */

CREATE DATABASE IF NOT EXISTS stuview_normalized;

USE stuview_normalized;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE `assessments` (
  `assessment_id` int(11) NOT NULL,
  `rubric_id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `assessor_id` int(11) NOT NULL,
  `assessor_type` varchar(25) NOT NULL,
  `pdf_assessment` longtext,
  `released` int(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `assignments` (
  `interview_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `completed` tinyint(4) NOT NULL DEFAULT '0',
  `submission_id` int(11) DEFAULT NULL,
  `due_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `classes` (
  `class_id` int(11) NOT NULL,
  `group_title` varchar(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `companies` (
  `company_id` int(11) NOT NULL,
  `company_name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `criteria` (
  `criteria_id` int(11) NOT NULL,
  `rubric_id` int(11) NOT NULL,
  `criteria_description` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `enrollments` (
  `class_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `faculty_assessors` (
  `assessor_id` int(11) NOT NULL,
  `faculty_uname` varchar(80) NOT NULL,
  `fname` varchar(80) NOT NULL,
  `lname` varchar(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `industry_assessors` (
  `assessor_id` int(11) NOT NULL,
  `fname` varchar(80) NOT NULL,
  `lname` varchar(80) NOT NULL,
  `company_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `instructor_notifications` (
  `notification_id` int(11) NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `notification` mediumtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `interviews` (
  `interview_id` int(11) NOT NULL,
  `title` varchar(75) NOT NULL,
  `description` longtext NOT NULL,
  `time_limit` int(11) NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `practice` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `notification` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `questions` (
  `question_id` int(11) NOT NULL,
  `interview_id` int(11) NOT NULL,
  `question` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `answers` (
  `question_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `content` TEXT NOT NULL,
  PRIMARY KEY(`question_id`, `student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `responses` (
  `response_id` int(11) NOT NULL,
  `criteria_id` int(11) NOT NULL,
  `assessment_id` int(11) NOT NULL,
  `response_numeric` int(11) NOT NULL,
  `response_comment` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `rubric` (
  `rubric_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `pdf_rubric` longtext
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `students` (
  `student_id` int(11) NOT NULL,
  `student_uname` varchar(80) NOT NULL,
  `fname` varchar(80) NOT NULL,
  `lname` varchar(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `student_notifications` (
  `notification_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `notification` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `submissions` (
  `submission_id` int(11) NOT NULL,
  `interview_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `answer_media` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


ALTER TABLE `assessments`
  ADD PRIMARY KEY (`assessment_id`);

ALTER TABLE `assignments`
  ADD PRIMARY KEY (`interview_id`,`student_id`);

ALTER TABLE `classes`
  ADD PRIMARY KEY (`class_id`);

ALTER TABLE `companies`
  ADD PRIMARY KEY (`company_id`);

ALTER TABLE `criteria`
  ADD PRIMARY KEY (`criteria_id`);

ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`class_id`,`student_id`);

ALTER TABLE `faculty_assessors`
  ADD PRIMARY KEY (`assessor_id`,`faculty_uname`);

ALTER TABLE `industry_assessors`
  ADD PRIMARY KEY (`assessor_id`);

ALTER TABLE `interviews`
  ADD PRIMARY KEY (`interview_id`);

ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`);

ALTER TABLE `questions`
  ADD PRIMARY KEY (`question_id`);

ALTER TABLE `responses`
  ADD PRIMARY KEY (`response_id`);

ALTER TABLE `rubric`
  ADD PRIMARY KEY (`rubric_id`);

ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`,`student_uname`);

ALTER TABLE `student_notifications`
  ADD PRIMARY KEY (`notification_id`);

ALTER TABLE `submissions`
  ADD PRIMARY KEY (`submission_id`,`interview_id`);


ALTER TABLE `assessments`
  MODIFY `assessment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
ALTER TABLE `classes`
  MODIFY `class_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
ALTER TABLE `companies`
  MODIFY `company_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `criteria`
  MODIFY `criteria_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
ALTER TABLE `faculty_assessors`
  MODIFY `assessor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
ALTER TABLE `industry_assessors`
  MODIFY `assessor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
ALTER TABLE `interviews`
  MODIFY `interview_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `questions`
  MODIFY `question_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
ALTER TABLE `responses`
  MODIFY `response_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `rubric`
  MODIFY `rubric_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
ALTER TABLE `students`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
ALTER TABLE `student_notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
ALTER TABLE `submissions`
  MODIFY `submission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

  INSERT INTO `assessments` (`assessment_id`, `rubric_id`, `submission_id`, `assessor_id`, `assessor_type`, `pdf_assessment`, `released`) VALUES
(4, 1, 1, 1, 'faculty', NULL, 1);

INSERT INTO `assignments` (`interview_id`, `student_id`, `instructor_id`, `completed`, `submission_id`, `due_date`) VALUES
(0, 1, 4, 0, NULL, '2016-06-05 00:00:00'),
(0, 6, 4, 0, NULL, '2016-06-05 00:00:00'),
(0, 7, 4, 0, NULL, '2016-06-05 00:00:00'),
(0, 8, 4, 0, NULL, '2016-06-05 00:00:00'),
(3, 1, 1, 1, 3,    '2016-05-31 17:12:00'),
(4, 4, 1, 1, NULL, '2016-05-31 00:00:00'),
(3, 5, 5, 0, NULL, '2017-06-26 00:00:00'),
(4, 5, 5, 1, 4,    '2017-07-01 00:00:00');

INSERT INTO `classes` (`class_id`, `group_title`) VALUES
(2, 'test group'),
(3, 'test group 2'),
(4, 'test group 3'),
(5, 'test group 4'),
(6, 'Senior Project');

INSERT INTO `companies` (`company_id`, `company_name`) VALUES
(1, 'test company');

INSERT INTO `criteria` (`criteria_id`, `rubric_id`, `criteria_description`) VALUES
(1, 1, 'Provided an appropriate amount of detail while effectively describing themselves.'),
(2, 2, 'Included achievements appropriate and relevant to getting a full time position.'),
(3, 3, 'Described the situation effectively and showed an effective strategy to resolving it.'),
(4, 4, 'Described strengths relevant to getting a full time position.'),
(5, 5, 'Did not answer none and seemed generally honest about their weakness.'),
(6, 6, 'Described what would actually be considered a good boss, i.e fair and willing to listen verses a boss that didn''t push people to actually do their jobs.'),
(7, 7, 'Described things that were appropriate and professional.');

INSERT INTO `enrollments` (`class_id`, `student_id`) VALUES
(1, 1),
(1, 5),
(1, 6),
(6, 1),
(6, 6),
(6, 7),
(6, 8);

INSERT INTO `faculty_assessors` (`assessor_id`, `faculty_uname`, `fname`, `lname`) VALUES
(0, 'stuviewadmin', 'Admin', 'Admin'),
(1, 'ssteiner', 'Stu', 'Steiner'),
(3, 'tcapual', 'Tom', 'Capual'),
(4, 'nwitmer', 'Nick', 'Witmer'),
(5, 'mpeterson', 'Michael', 'Peterson');

INSERT INTO `industry_assessors` (`assessor_id`, `fname`, `lname`, `company_id`) VALUES
(1, 'Nick', 'Witmer', 1),
(2, 'Tom', 'Capual', 1),
(3, 'Tom', 'Capual', 1);

INSERT INTO `interviews` (`interview_id`, `title`, `description`, `time_limit`, `instructor_id`, `practice`) VALUES
(0, 'Basic HR Practice Interview', 'A good starting place for anyone preparing for interviews using this system. It will mimic the HR portion of your interviews and is applicable to any major. Questions will be about you as a person and your skills in general.', 35, 0, 0),
(1, 'Basic Technical Interview', 'Try your hand at typing in code to solve basic technical problems, such as writing "Hello World" or printing an array.', 15, 0, 0),
(3, 'Third Interview TITLE', 'Third interview DESCRIPTION', 15, 5, 1),
(4, 'Fourth Interview TITLE', 'Fourth interview DESCRIPTION', 15, 5, 0);

INSERT INTO `questions` (`question_id`, `interview_id`, `question`) VALUES
(1,  0, 'Tell me about yourself?'),
(2,  0, 'What have your achievements been to date?'),
(3,  0, 'What is the most difficult situation you have had to face and how did you tackle it?'),
(4,  0, 'What are your strengths?'),
(5,  0, 'What is your greatest weakness?'),
(6,  0, 'Describe the best boss you ever reported to.'),
(7,  0, 'Tell me about what motivates you. '),
(8,  3, 'Interview 3 Question 1'),
(9,  3, 'Interview 3 Question 2'),
(10, 3, 'Interview 3 Question 3'),
(11, 3, 'Interview 3 Question 4'),
(12, 4, 'Write a "hello world" program in java'),
(13, 4, 'Write a "hello world" program in c'),
(14, 4, 'Write a "hello world" program in mips assembly'),
(15, 4, 'Write a "hello world" program in html');

INSERT INTO `answers` (`question_id`,`student_id`,`content`) values
(12, 5, '<div>public class HelloWorld {</div><div>&nbsp;&nbsp;&nbsp;&nbsp;public static void main(String [] args) {</div><div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;System.out.println("Hello World");<div>&nbsp;&nbsp;&nbsp;&nbsp;}</div><div>}</div>'),
(13, 5, '<div>#include<stdio.h>;</div><div>int main() {</div><div>&nbsp;&nbsp;&nbsp;&nbsp;printf("hello world!\n");</div><div>&nbsp;&nbsp;&nbsp;&nbsp;return 0;</div><div>}</div><div></div>'),
(14, 5, '<div>.data</div><div><br></div><div>helloworld: .asciiz "hello world!\n"</div><div>.globl main</div><div>.text</div><div><br></div><div>main:</div><div><br></div><div><div>li $v0, 4<br></div><div>la $a0, helloworld</div><div>syscall</div></div><div><br></div><div>exit:</div><div><br></div><div>addi $v0, $0, 10</div><div>syscall</div><div><br></div><div><br></div><div><br></div>'),
(15, 5, '&lt;!DOCTYPE html&gt;<div>&lt;html&gt;</div><div>&nbsp; &nbsp; &lt;head&gt;&lt;/head&gt;</div><div>&nbsp; &nbsp; &lt;body&gt;</div><div>&nbsp; &nbsp; &nbsp; &nbsp; &lt;h1&gt;hello world!&lt;/h1&gt;</div><div>&nbsp; &nbsp; &lt;/body&gt;</div><div>&lt;/html&gt;</div>');

INSERT INTO `responses` (`response_id`, `criteria_id`, `assessment_id`, `response_numeric`, `response_comment`) VALUES
(1, 1, 1, 99, 'this is a response');

INSERT INTO `rubric` (`rubric_id`, `question_id`, `pdf_rubric`) VALUES
(1, 1, NULL),
(2, 2, NULL),
(3, 3, NULL),
(4, 4, NULL),
(5, 5, NULL),
(6, 6, NULL),
(7, 7, NULL);

INSERT INTO `students` (`student_id`, `student_uname`, `fname`, `lname`) VALUES
(1, 'nwitmer', 'Nicholas', 'Witmer'),
(5, 'mpeterson', 'Michael', 'Peterson'),
(6, 'solson31', 'Shane', 'Olson'),
(7, 'jflynn', 'Jake', 'Flynn'),
(8, 'jreisenauer', 'James', 'Reisenauer');


INSERT INTO `student_notifications` (`notification_id`, `student_id`, `notification`) VALUES
(4, 6, 'You have been assigned to compleate the Test problem interview by 2016-04-25 17:12:00'),
(5, 45, 'You have been assigned to complete the bla bla bla interview by 2016-04-25'),
(6, 7, 'You have been enrolled in Senior Project'),
(7, 8, 'You have been enrolled in Senior Project'),
(8, 1, 'You have been enrolled in Senior Project'),
(9, 6, 'You have been enrolled in Senior Project'),
(10, 1, 'You have been assigned to complete the Basic HR Practice Interview interview by 2016-06-05'),
(11, 6, 'You have been assigned to complete the Basic HR Practice Interview interview by 2016-06-05'),
(12, 7, 'You have been assigned to complete the Basic HR Practice Interview interview by 2016-06-05'),
(13, 8, 'You have been assigned to complete the Basic HR Practice Interview interview by 2016-06-05');

INSERT INTO `submissions` (`submission_id`, `interview_id`, `student_id`, `answer_media`) VALUES
(1, 3, 1, '3B6LO6uYNUM'),
(2, 3, 1, 'q-XEIvtmM60'),
(3, 3, 1, 'yGbKpsKOD6Y'),
(4, 4, 5, 'answer_media');
