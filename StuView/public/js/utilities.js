function downloadFile(fileName, data) {
    var url = window.URL.createObjectURL(data);
    a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(function () {
        window.URL.revokeObjectURL(url);
        if(a && a.parentNode == document.body)
            document.body.removeChild(a);
    }, 2000);
}

function downloadUrl(fileName, url, responseType, successCallback, errorCallback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = responseType;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            switch (xhr.status) {
                case 200:
                    downloadFile(fileName, xhr.response);
                    if(typeof successCallback == 'function') successCallback();
                    break;
                default:
                    if(typeof errorCallback == 'function') errorCallback();
            }
        }
    };
    xhr.send();
};


// upload a file using the endpoint storeMedia
function uploadMedia(fileName, blob) {
    var formData = new FormData();
    formData.append('data', blob);
    formData.append('fileName', fileName);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'storeMedia', true);
    xhr.onError = function () {
        throw "There was an error uploading the file " + fileName;
    };
    xhr.send(formData);
}

// Setup getUserMedia()
if (!navigator.getUserMedia)
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
if (!navigator.cancelAnimationFrame)
    navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
if (!navigator.requestAnimationFrame)
    navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;
