"use strict";
/* This is used to upload to Vimeo through their API.
 * It checks againts the user's API limitations and gives
 * oldest videos priority for upload. Errors are thrown when something
 * critical went wrong. Log file is in StuView/storage/logs/vimeoUploadLog.log */


//File paths.
var vimeoConfigFilePath = __dirname + '/config.json';
var vimeoQuotaFilePath = __dirname + '/quota.json';
var dbCredsFilePath = __dirname + '/submit.json';
var vimeoUploadLogFilePath = __dirname + '/../../../storage/logs/vimeoUploadLog.log';
var vimeoLibPath = '../../../node_modules/vimeo/index';
var videoDirPath = process.argv[2];
var databaseLibPath = __dirname + '/database.js';

//Libraries and JSON objects.
require('dotenv').config({path: __dirname + '/../../../.env'});
var fs = require('fs');
var urlModule = require('url');
var Vimeo = require(vimeoLibPath).Vimeo;
var Database = require(databaseLibPath);
var vimeoConfig = require(vimeoConfigFilePath);
var vimeoQuota = null;

//Variable to keep track of how many submissions have been created, to properly close the databse connection when done.
var databaseRequests = 0;
var totalRequests = 0;

//Build Vimeo library object.
var vimeoLib = new Vimeo(vimeoConfig.client_id, vimeoConfig.client_secret, vimeoConfig.access_token);

//Object used to talk to database.
var mysql = null;
//Check vimeo quota file and db file. If db file doesn't exist, script ends with an error. If quota file doesn't exist, a new one is created.
checkFiles((checkFilesError) => {

    if (checkFilesError) {
        //Log and throw the error.
        log(checkFilesError, true);
    }else{

      //Start the database object.
      mysql = new Database(process.env.DB_HOST, process.env.DB_USERNAME, process.env.DB_PASSWORD, process.env.DB_DATABASE);

      mysql.startConnection((connectionError) => {
          //If connection to database unsuccessful log and throw an error.
          if (connectionError) {
              log(connectionError, true);
          }
          console.log('Database connection created');

      });

      // //Create a list of files from all videos ready to be uploaded, depending the available amount of requests and space. Priority given to oldest videos.
      createQueue((createQueueError, filePaths) => {
          if (createQueueError) {
              //Non fatal error, just log the error, continue normally.
              if(createQueueError.code == 'spaceLimitReached'){
                  log(createQueueError.message, false);
              }else {

                  //Some fatal error, log and throw the error.
                  log(createQueueError.message, true);
              }
          }else{
              upload(filePaths);
          }
      });
    }


});


/**
 *  Check if the needed files exist.
 *  @param {function} callback  First parameter contains an error if any, otherwise null.
 */
function checkFiles(callback) {

    //Check if vimeo quota file exists.
    try {
        vimeoQuota = require(vimeoQuotaFilePath);
        //Forcing an error in case the rate remaining is low, so it gets updated in case it has reset.
        if (vimeoQuota.rate_remaining < 3) {
            throw new Error("Rate remaining is less than 3.");
        }
        callback(null);

    } catch (requireError) {

        //Create a new quota file. This makes a request to vimeo to get the most uptodate info.
        createQuotaFile(vimeoQuotaFilePath, (createQuotaFileError) => {
            if (createQuotaFileError) {
                callback(createQuotaFileError);
            } else {
                vimeoQuota = require(vimeoQuotaFilePath);
                callback(null);
            }
        });
    }
}

/**
 * All videos in the given folder are scanned.
 * A subset is created to be uploaded, depending on the amount of requests/space available.
 * @param {function} callback  First parameter will contain an error if any otherwise null. Second will contain
 *                             the string array of the file paths of the created subset.
 */
function createQueue(callback) {

    var rateRemaining = parseInt(vimeoQuota.rate_remaining);
    var rateLimit = parseInt(vimeoQuota.rate_limit);
    var spaceMax = parseInt(vimeoQuota.space_max);
    var spaceUsed = parseInt(vimeoQuota.space_used);

    console.log("rate remaining: " + rateRemaining);
    console.log("rate limit: " + rateLimit);
    console.log("space max: " + spaceMax);
    console.log("space used: " + spaceUsed);

    fs.readdir(videoDirPath, (readErr, files) => {

        if (readErr) {
            callback({message: readErr, code: 'fatal'}, null);
            return;
        }

        //Sorting videos giving oldest videos priority.
        files.sort((f1, f2) => {

            var fileOneStats = fs.statSync(videoDirPath + "/" + f1);
            var fileTwoStats = fs.statSync(videoDirPath + "/" + f2);
            var date1 = fileOneStats["birthtime"];
            var date2 = fileTwoStats["birthtime"];

            if (date1.getTime() < date2.getTime()) {
                return -1;
            }
            if (date1.getTime() > date2.getTime()) {
                return 1;
            }
            return 0;
        });

        var filesOk = [];
        var i = 0;

        /*  Creating subset based on the available requests/space, video type. Dividing the rate_remaining by 2 since
         *  It takes 2 total requests, one to upload and another to set its properties such as name. */
        function next() {
            if (i < files.length && rateRemaining > 2) {


                var filePath = videoDirPath + "/" + files[i];
                if(fs.lstatSync(filePath).isFile()){
                    //Splitting file name from extension.
                    var fileExt = files[i].split('.');

                    //Getting the student uname and interview id seperated.
                    var paramSplit = fileExt[0].split('_');

                    var studentUname = paramSplit[0];
                    var interviewId = paramSplit[1].substring(9, paramSplit[1].length);
                    var params = {
                        student_uname: studentUname,
                        interview_id: interviewId
                    };

                    // TODO:  Needs to be debugged due some assignments not being there when they are supposed to.
            		//Commented to allow for submission to be created anyways.
                    //This where we would double check to make sure the parameters given are valid with the current state of the database.
                    // mysql.checkAssignementExists(params, (checkAssignementExistsError) => {});
                    //If there was an issue with checking the paramaters againts the database, terminate this function and callback with the error.
                    //It means there is something wrong with the database or another error related to the mysql connection.
                    //This was commented out because of some issues when ran on the school server.


                            var fileSize = parseInt(fs.statSync(filePath)['size']);

                            //Can add additional extentions as needed.
                            if (fileSize + spaceUsed < spaceMax) {
                                if ((fileExt[fileExt.length - 1] == 'mp4' ||
                                        fileExt[fileExt.length - 1] == 'mpeg')) {
                                    spaceUsed += fileSize;
                                    rateRemaining = rateRemaining - 2;
                                    filesOk.push(filePath);
                                    i++;
                                    next();
                                }
                            } else {
                                //Callback with an object containing details of the error.
                                callback({
                                    message: 'Space limit reached.',
                                    code: 'spaceLimitReached'
                                }, null);
                            }
                        //}
                    // });
                }else{
                    //If it is not a file, continue checking the rest of the files.
                    i++;
                    next();
                }

            } else if (i >= files.length) {
                //Were able to iterate through all files without any issues.
                callback(null, filesOk);
            }
        }
        next();

    });
}

/**
 *  Upload the videos to Vimeo in the given file path array.
 *  @param {string[]} files String array containing the file paths of the videos to be uploaded to Vimeo.
 */
function upload(files) {

    totalRequests = files.length;
    for (var i = 0; i < files.length; i++) {
        uploadVideo(files[i]);
    }

}

/**
 *  @param {string} file File path of a video to be uploaded to Vimeo.
 */
function uploadVideo(file) {
    var rate_remaining = parseInt(vimeoQuota.rate_remaining);
    var rate_limit = parseInt(vimeoQuota.rate_limit);
    var space_max = parseInt(vimeoQuota.space_max);
    var space_used = parseInt(vimeoQuota.space_used);


    //Creating a submission, if video fails to upload, will create submission anyways, with a code for the 'answer_media' being 'FAILED'.

    //Splitting file name from extension.
    var fileName = file.split('/');
    var fileExt = fileName[fileName.length - 1].split('.');

    //Getting the student uname and interview id seperated.
    var paramSplit = fileExt[0].split('_');

    //Default answer_media is set to 'FAILED' in case video was not uploaded successfully, submission is still created.
    var studentUname = paramSplit[0];
    var interviewId = paramSplit[1].substring(9, paramSplit[1].length);
    var params = {
        student_uname: studentUname,
        interview_id: interviewId,
        answer_media: 'FAILED'
    };

    console.log("Uploading " + file);

    vimeoLib.streamingUpload(file,
        function(streamingUploadError, body, status, headers) {

            if (streamingUploadError) {
                //Log and throw the error.
                log(streamingUploadError, true);

            } else {

                console.log(file + " uploaded.");
                //Setting name and privacy privacy of the video.
                var videoID = headers.location;
                var videoFilePath = file.split('/');
                var videoName = videoFilePath[videoFilePath.length - 1].split('.')[0];
                var videoPrivacyView = 'anybody';

                var query = {
                    name: videoName,
                    privacy: {
                        view: videoPrivacyView
                    }
                };

                var options = urlModule.parse('https://api.vimeo.com' + videoID, true);
                options.query = query;
                options.method = 'PATCH';

                vimeoLib.request(options, (requestError, body, status, headers) => {

                    if (requestError) {
                        //Log and throw the error.
                        log(requestError, true);

                    } else {

                        //Updating quota file.
                        var fileSize = parseInt(fs.statSync(file)['size']);
                        space_used += fileSize;
                        rate_limit = headers["x-ratelimit-limit"];
                        rate_remaining = headers["x-ratelimit-remaining"];

                        updateQuotaFile(vimeoQuotaFilePath, space_max, space_used, rate_limit, rate_remaining);

                        //Adding video url to the params, so it can be added to the database.
                        var videoIdSplit = videoID.split('/');
                        params.answer_media = 'https://vimeo.com/' + videoIdSplit[videoIdSplit.length - 1];

                        mysql.createSubmission(params, (createSubmissionError) => {
                            databaseRequests++;
                            //If there was an issue creating the submission, log and terminate. The video will not be deleted.
                            if(createSubmissionError){
                                log(createSubmissionError, true);
                            }else{
                              //Check if all videos have been proccessed, if so close database connection.
                              if(totalRequests == databaseRequests){
                                mysql.stopConnection();
                              }
                            }


                        });



                        //removing video.
                        fs.unlink(file, (unlinkError) => {
                            if (unlinkError) {
                                //Logging error only.
                                log('Failed to delete ' + file + ' : ' + unlinkError, false);

                            } else {
                                console.log(file + " deleted.");

                            }
                        });
                    }
                });
            }
        },
        (uploaded_size, file_size) => {
            //progress callback.
        });
}

/**
 *  JSON string creator
 *  @param {string[]} keys  Contains all of the keys to be created.
 *  @param {string[]} values  Contains all of the values corresponding to the same index as the keys.
 */
function createJSON(keys, values) {
    var json = '{';
    for (var i = 0; i < keys.length; i++) {

        if (i == keys.length - 1) {
            json += '"' + keys[i] + '" : "' + values[i] + '"';
        } else {
            json += '"' + keys[i] + '" : "' + values[i] + '",';
        }
    }
    json += '}';

    return json;

}

/**
 * Updates the vimeo quota file with the given parameters.
 */
function updateQuotaFile(filePath, space_max, space_used, rate_limit, rate_remaining) {

    var keys = ['space_used', 'space_max', 'rate_limit', 'rate_remaining'];
    var values = [space_used, space_max, rate_limit, rate_remaining];
    var strJSON = createJSON(keys, values);

    fs.writeFile(filePath, strJSON, (err) => {
        if (err) {
            log(err, true);
        }
        console.log("Quota file updated.");
    });
}

/**
 *  Creates a quota JSON file at the given path. It makes a request to the vimeo API.
 *  @param {string} filePath The file path where the file will be created.
 * @param {function} callback Only one paramater that will contain an error if any. Otherwise null.
 */
function createQuotaFile(filePath, callback) {
    vimeoLib.request('https://api.vimeo.com/me', function(err, body, status, headers) {
        if (err) {
            log(err, false);
        } else {
            var space_max = body.upload_quota.space.max;
            var space_used = body.upload_quota.space.used;
            var rate_limit = headers["x-ratelimit-limit"];
            var rate_remaining = headers["x-ratelimit-remaining"];

            var keys = ['space_used', 'space_max', 'rate_limit', 'rate_remaining'];
            var values = [space_used, space_max, rate_limit, rate_remaining];
            var json = createJSON(keys, values);

            fs.writeFile(filePath, json, (err) => {
                if (err) {
                    callback(err);
                } else {
                    console.log(filePath + " created.");
                    callback(null);
                }

            });
        }
    });
}

/**
 *  Logs the given string to the log file: vimeoUploadLog.txt
 *  @param {string} error The error to be logged.
 * @param {boolean} throwError Boolean to throw an error after logging the error message.
 */
function log(error, throwError) {
    var dateStamp = new Date();
    fs.appendFile(vimeoUploadLogFilePath, dateStamp + " : " + error + "\n", (appendFileError) => {
        if (appendFileError) {
            throw new Error("There was an error writting to the log file.");
        } else {
            if (throwError) {
                mysql.stopConnection();
                throw new Error(error);
            }
        }
    });
}
