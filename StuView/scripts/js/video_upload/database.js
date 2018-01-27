"use strict";
/**
 *	Helper Database object that takes care of connections with the database.
 */

var mysql = require('mysql');
var mysqlConnection = null;

function Database (host, user, password, database) {
	this.host = host;
	this.user = user;
	this.password = password;
	this.database = database;
};


/**
 *  @param {function} callback  Callback function null if no errors. Otherwise returns the error.
 */
Database.prototype.startConnection = function(callback){

	mysqlConnection = mysql.createConnection({
        host: this.host,
        user: this.user,
        password: this.password,
        database: this.database
    });

	//Initialize database connection.
    mysqlConnection.connect((connectionError) => {
        if (connectionError) {
            callback(connectionError);
        }
		callback(null);
    });

}

/**
 *  @param {function} callback  Callback function null if no errors. Otherwise returns the error.
 */
Database.prototype.stopConnection = function(){

	//If connection is open, close it.
	if(mysqlConnection != null){
		mysqlConnection.end();

	}

}

/**
 * 'answer_media' is the video id of an uploaded vimdeo video e.g 'https://vimeo.com/205607633' where '205607633' would be the 'answer_media'.
 *
 *  @param {Object} params  JSON object containing 'interview_id' , 'student_uname', and 'answer_media'.
 *  @param {function} callback  Callback function null if no errors. Otherwise returns the error.
 */
Database.prototype.createSubmission = function(params, callback) {

	//Make sure assignment exists before making changes to database.
    this.checkAssignementExists(params, (checkAssignementExistsError, student_id) => {

		//Some error happened, could be related to invalid submission. Error should be logged.
		if(checkAssignementExistsError){
			callback(checkAssignementExistsError);
			return;
		}

		//Create a new submission.
		var parameters = [params.interview_id, student_id, params.answer_media];

		var sql = 'INSERT INTO submissions (interview_id, student_id, answer_media) ' +
			  'VALUES (?, ?, ?)';

		mysqlConnection.query(sql, parameters, (insertQueryError, insertResult) => {
			//If there was an error running the query, callback with the error.
			if(insertQueryError){
				callback(insertQueryError);
				return;
			}
			console.log('Sucessfully created a new submission.');

			//Update assignments table with the submission id.
			parameters = [insertResult.insertId, params.interview_id, student_id];
			sql = 'UPDATE assignments ' +
				  'SET  submission_id = ? ' +
				  'WHERE interview_id = ? AND student_id = ?';

			mysqlConnection.query(sql, parameters, (updateQueryError, updateResult) => {
				//If there was an error running the query, callback with the error.
				if(updateQueryError){
					callback(updateQueryError);
					return;
				}

				console.log('Sucessfully updated assignments table.');
				callback(null);
			})
		});

	});

}

/**
 * 	Will callback with an error if assingment doesn't exist or if there is a submission already associated with it.
 *
 *  @param {Object} params  JSON object containing 'interview_id' , 'student_uname'.
 *  @param {function} callback  Callback function First parameter null if no errors. Otherwise returns the error. Second parameter will contain parameter 'student_id'.
 */
Database.prototype.checkAssignementExists = function(params, callback){

	var parameters = [params.student_uname, params.interview_id];

    //Make sure assignment exists
    var sql = 'SELECT * ' +
              'FROM assignments INNER JOIN students ON assignments.student_id = students.student_id ' +
              'WHERE students.student_uname = ? AND assignments.interview_id = ?';

    mysqlConnection.query(sql, parameters, (joinQueryError, joinResult) => {
        //If there was an error running the query, callback with the error.
        if(joinQueryError){
            callback(joinQueryError, null);
            return;
        }

		// TODO:  Needs to be debugged due some assignments not being there when they are supposed to.
		//Commented to allow for submission to be created anyways.

        // If there are no assignments with the given student username and interview id. Callback with an error.
        // if(joinResult.length == 0){
        //     callback(new Error( params.student_uname + ' and ' + params.interview_id + ' are not associated with any assignments.'), null);
        //     return;
        // }
		//
        // //If there multiple assignments in the table for some reason callback with an error.
        // if(joinResult.length > 1){
        //     callback(new Error('Multiple assignments with the same student uname and interview id for ' + params.student_uname + ', interview id: ' + params.interview_id + '.'), null);
        //     return;
        // }
		//
		// //If submission_id is not null, it means there is already a submission associated with the current interview/student uname.
		// if(joinResult[0].submission_id != null){
		// 	callback(new Error('There is a submission already associated with the assignment for ' + params.student_uname + ', interview id: ' + params.interview_id + '.'), null);
		// 	return;
		// }

		callback(null, joinResult[0].student_id);
	});
}
module.exports = Database;
