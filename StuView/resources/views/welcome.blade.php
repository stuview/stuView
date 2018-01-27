<!DOCTYPE html>
<html>
    <head>
        <title>Laravel</title>

        <link href="https://fonts.googleapis.com/css?family=Lato:100" rel="stylesheet" type="text/css">
        <script src="//code.jquery.com/jquery-1.12.0.min.js"></script>
        <script src="//code.jquery.com/jquery-migrate-1.2.1.min.js"></script>

        <style>
            html, body {
                height: 100%;
            }

            body {
                margin: 0;
                padding: 0;
                width: 100%;
                display: table;
                font-weight: 100;
                font-family: 'Lato';
            }

            .container {
                text-align: center;
                display: table-cell;
                vertical-align: middle;
            }

            .content {
                text-align: center;
                display: inline-block;
            }

            .title {
                font-size: 96px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="content">
                <div class="title">Laravel 5</div>
                <button type="button" id = "button">Student</button>
                <button type="button" id = "button8">Get Student</button>
                <button type="button" id = "button9">Get Students</button>
                <button type="button" id = "button10">Get Majors</button>
                <button type="button" id = "button1">Faculty</button>
                <button type="button" id = "button11">Get Faculty</button>
                <button type="button" id = "button2">Industry</button>
                <button type="button" id = "button12">Get Industry Assessor</button>
                <button type="button" id = "button3">Problem</button>
                <button type="button" id = "button5">Get Problem</button>
                <button type="button" id = "button16">Get Questions</button>
                <button type="button" id = "button13">Get Problems</button>
                <button type="button" id = "button6">Get Rubric</button>
                <button type="button" id = "button7">Get Criteria</button>
                <button type="button" id = "button4">Problem with Criteria</button>
                <button type="button" id = "button14">Assignment</button>
                <button type="button" id = "button15">GetAssignments</button>
                <button type="button" id = "button17">Submission</button>
                <button type="button" id = "button18">Class Assignment</button>
                <button type="button" id = "button19">Classes</button>
            </div>
        </div>
    <div id = 'putHere'>

    </div>
    </body>
    <script>
        $("#button").click(
                function()
                {
                    $.post("storeStudent", {student_uname: "itprostu14", fname: "nick", lname:  "witmer", class_standing: "senior",
                                            major_id: 1});
                }
        )
        $("#button1").click(
                function()
                {
                    $.post("storeFaculty", {faculty_uname: "tcapual", fname: "Tom", lname:  "Capual"});
                }
        )
        $("#button2").click(
                function()
                {
                    $.post("storeIndustryAssessor", {fname: "Tom", lname:  "Capual", company_name: "test company"});
                }
        )
        $("#button3").click(
                function()
                {
                    $.post("storeInterview", {title: "Test problem", description: 'Lorem ipsum dolor sit amet', time_limit: 10});
                }
        )
        $("#button4").click(
                function()
                {
                    $.post("storeInterview", {title: "Test problem", description: 'Lorem ipsum dolor sit amet', time_limit: 10}, function(result)
                    {
                        $.post("storeQuestion", {interview_id: result.id, question: 'did you brush your teeth', pdf_rubric: '/home/data/pdfrubric.pdf'})
                    });
                }
        )
        $("#button5").click(
                function()
                {
                    $.post("getInterview", {interview_id: 1});
                }
        )
        $("#button6").click(
                function()
                {
                    $.post("getRubric", {question_id: 1});
                }
        )
        $("#button7").click(
                function()
                {
                    $.post("getCriteria", {rubric_id: 1});
                }
        )
        $("#button8").click(
                function()
                {
                    $.post("getStudent", {student_uname: 'nwitmer'});
                }
        )
        $("#button9").click(
                function()
                {
                    $.post("getClassStudents", {class_id: 1});
                }
        )
        $("#button10").click(
                function()
                {
                    $.post("getMajors", {});
                }
        )
        $("#button11").click(
                function()
                {
                    $.post("getInstructor", {faculty_uname: 'sstiner'});
                }
        )
        $("#button12").click(
                function()
                {
                    $.post("getIndustryAssessor", {assessor_id: 1});
                }
        )
        $("#button13").click(
                function()
                {
                    $.post("getInterviews", {});
                }
        )
        $("#button14").click(
                function()
                {
                    var date = new Date(2016, 2, 25, 10, 12, 0);
                    $.post("storeAssignment", {interview_id: 3, student_id: 5, due_date: date.toISOString()});
                }
        )
        $("#button15").click(
                function()
                {
                    $.post("getAssignments", {student_id: 5});
                }
        )
        $("#button16").click(
                function()
                {
                    $.post("getQuestions", {interview_id: 1});
                }
        )
        $("#button17").click(
                function()
                {
                    $.post("storeSubmission", {problem_id: 3, student_id: 5, answer_text: 'Lorem ipsum dolor sit amet',
                                                answer_media: 'www.youtube.com/test'});
                }
        )
        $("#button18").click(
                function()
                {
                    var date = new Date(2016, 2, 25, 10, 12, 0);
                    $.post("storeClassAssignment", {class_id: 1, interview_id: 17, due_date: date.toISOString()});
                }
        )
        $(':file').change(function(){
            var file = this.files[0];
            var name = file.name;
            var size = file.size;
            var type = file.type;
        });
        $("#button19").click(
                function()
                {
                    $.post("getClasses", {});
                }
        )

    </script>
</html>
