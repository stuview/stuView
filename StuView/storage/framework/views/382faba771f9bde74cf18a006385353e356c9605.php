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
            </div>
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
                    $.post("storeFaculty", {faculty_uname: "itprostu14", fname: "Tom", lname:  "Capual"});
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
                    $.post("storeProblem", {title: "Test problem2", questions:  ["Lorem ipsum dolor sit amet", 'test'],
                                                        pdf_rubric: "test/test.pdf"});
                }
        )
        $("#button4").click(
                function()
                {
                    $.post("storeProblem", {title: "Test problem2", questions:  ["Lorem ipsum dolor sit amet", 'test'],
                        criteria: ["test criteria 1", "test criteria 2"]});
                }
        )
        $("#button5").click(
                function()
                {
                    $.post("getProblem", {problem_id: 2});
                }
        )
        $("#button6").click(
                function()
                {
                    $.post("getRubric", {problem_id: 4});
                }
        )
        $("#button7").click(
                function()
                {
                    $.post("getCriteria", {rubric_id: 14});
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
                    $.post("getStudents", {major_id: 1});
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
                    $.post("getInstructor", {assessor_id: 1});
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
                    $.post("getProblems", {});
                }
        )
        $("#button14").click(
                function()
                {
                    var date = new Date(2016, 2, 25, 10, 12, 0);
                    $.post("storeAssignment", {problem_id: 3, student_id: 5, due_date: date.toISOString()});
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
                    $.post("getQuestions", {problem_id: 11});
                }
        )
    </script>
</html>
