function DomRecorder(configObject) {
    if(!configObject
        || typeof(configObject.element)        != 'object'
        || typeof(configObject.finishRecordCallback) != 'function'
        || configObject.chunkLength && typeof(configObject.chunkLength) != 'number')
        throw "DomRecorder() requires a single configuration object as a parameter: \n \
        \   {\n \
        \       element                  : HTML element to be recorded,\n \
        \       finishRecordCallback     : function(Blob videoData, int id, boolean lastChunk){ ... }\n \
        \       chunkLength (optional)   : integer specifying how often (in seconds) chunks of the recording should be saved (if not specified audio is only saved once) \
        \   }\n";
    var timeout              = (configObject.timeout || setTimeout);
    var recordedDiv          = configObject.element,
        finishRecordCallback = configObject.finishRecordCallback,
        chunkLength          = configObject.chunkLength || -1,
        framesPerSecond      = configObject.frameRate || 30;

    var canvas2d             = document.createElement('canvas'),
        context              = canvas2d.getContext('2d'),
        isRecording          = false,
        millisPerFrame       = 0,
        startRecordTime      = 0,
        lastStoredFrame      = -1,
        thisChunkStartTime   = -1,
        thisChunkId          = 0,
        encoderWorker        = null,
        recordDimensions     = undefined,
        thisImage            = null;

    // The main "loop" of our recorder, this function captures individual frames of what will become our video.
    function getFrame() {

        if(isRecording) {
            // Get a snapshot of the div "elementToShare" and render it's contents to thisImage
            html2canvas(recordedDiv, {
                onrendered: function (canvas) {
                    // All this dimension business is because our video encoder will freak out if any of the frames are
                    // a different size which could happen if a user resizes the window during recording
                    if (!recordDimensions && canvas.width > 0 && canvas.height > 0) {
                        recordDimensions = {width: canvas.width, height: canvas.height};
                        canvas2d.width = recordDimensions.width;
                        canvas2d.height = recordDimensions.height;
                    }

                    if (recordDimensions) {
                        var currentTime = Date.now();
                        var imageData = canvas.getContext('2d').getImageData(0, 0, recordDimensions.width, recordDimensions.height);
                        context.putImageData(imageData, 0, 0);
                        thisImage = canvas2d.toDataURL('image/webp');
                        storeFrame(currentTime);
                    }
                    timeout(getFrame, 1);
                },
                allowTaint: true,
                background: "white",
                grabMouse: false
            });
        }
    }

    function storeFrame(currentTime) {
        var currentChunkLength = currentTime - thisChunkStartTime;

        // If we are doing chunking and this chunk is long enough, save this chunk and reset for the next chunk
        if (chunkLength > 0 && currentChunkLength >= (chunkLength * 1000)) {
            thisChunkStartTime = currentTime;
            encodeChunk(false);
            thisChunkId++;
            startNewWorker();
        }

        var currentFrame = Math.floor((currentTime - startRecordTime) / millisPerFrame);

        if (currentFrame > lastStoredFrame) {
            // In case we skipped some frames, fill the missing ones with latest capture we have
            for (var frameIndex = lastStoredFrame + 1; frameIndex <= currentFrame; ++frameIndex) {
                //console.log("encoding frame: " + frameIndex);
                encoderWorker.postMessage({command: "capture",image: thisImage});
            }
            lastStoredFrame = currentFrame;
        }
    }

    function startRecording(){
        var now = Date.now();
        thisChunkStartTime = now;
        startRecordTime = now;

        isRecording = true;
        lastStoredFrame = -1;
        thisChunkId = 0;
        startNewWorker();

        getFrame();
    }

    function encodeChunk(isLastChunk){
        encoderWorker.postMessage({command: 'encode', isLastChunk: isLastChunk});
    }

    function stopRecording(){
        isRecording = false;
        encodeChunk(true);
        canvas2d.hidden = true;
    }

    function receiveWorkerMessage(message){
        switch(message.data.command){
            case 'finishedEncoding':
                var data = message.data.data;
                var id = message.data.id;
                finishRecordCallback(new Blob([data], {type: 'video/webm'}), id, message.data.isLastChunk);
                break;
            default:
                throw 'domRecorder received an unknown message from domRecorderWorker: ' + JSON.stringify(message);
        }
    }

    function startNewWorker(){
        encoderWorker = new Worker("js/recording_dom/domRecorderWorker.js");
        if(!encoderWorker)
            throw "There was a problem creating the DOM encoder worker !!!";

        encoderWorker.onmessage = receiveWorkerMessage;
        encoderWorker.postMessage({command: 'start', frameRate: framesPerSecond, id: thisChunkId});
    }

    function init() {
        millisPerFrame = 1000 / framesPerSecond;
   };

    init();

    // Return an object that provides a convenient interface for controlling the recorder.
    return {
        start : startRecording,
        stop  : stopRecording
    };
}
