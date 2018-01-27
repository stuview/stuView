/**
 *  Script for creating multiple copies of one video for testing purposes.
 */

var fs = require('fs');
var option = process.argv[2];
var filePath = process.argv[3];
var destinationPath = process.argv[4];
var copies = process.argv[5];


if(option == 'd'){
  duplicateFile(copies, filePath, destinationPath);
}else if(option == 'c'){
  getCreationTime(filePath);
}


function getCreationTime(path) {
    fs.readdir(path, (rerr, files) => {

        for (var i = 0; i < files.length; i++) {
            var fileCreationDate = fs.statSync(path + "/" + files[i])['birthtime'];
            console.log(files[i] + " " + fileCreationDate);
        }

    });
}




function duplicateFile(numCopies, path, destPath) {
    var split = path.split(".");
    var ext = split[split.length - 1];
    var i = numCopies;

    function next() {

        if (i >= 0) {
            //creating videos 2 seconds apart to have a larger gap between their creation times.
            var newFileName = destPath + "/copy_" + i + "." + ext;
            var stream = fs.createReadStream(path).pipe(fs.createWriteStream(newFileName));
            stream.on('finish', function() {
                console.log("created " + newFileName);
                i--;
                next();
            });
        }
    }
    next();
}
