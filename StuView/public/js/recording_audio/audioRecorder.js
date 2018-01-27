// TODO: Consider exposing a function for controlling mic gain.

function AudioRecorder(configObject) {
    if(!configObject
        || typeof(configObject.finishRecordCallback)   != 'function'
        || typeof(configObject.analyzerRenderCallback) != 'function'
        || configObject.bitRate    && typeof(configObject.bitRate)    != 'number'
        || configObject.bufferSize && typeof(configObject.bufferSize) != 'number')
        throw "AudioRecorder() requires a single configuration object as a parameter: \n \
        \   {\n \
        \       finishRecordCallback    : function(Blob blob){ ... },\n \
        \       analyzerRenderCallback  : function(DOMHighResTimeStamp time, AnalyzerNode analyzer){ ... },\n \
        \       bitRate                 : integer (optional),\n \
        \       bufferSize              : integer (optional), \n \
        \       chunkLength (optional)  : integer specifying how often (in seconds) chunks of the recording should be saved (if not specified audio is only saved once) \
        \   }\n";

        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        var finishRecordCallback = configObject.finishRecordCallback,
            analyzerRenderCallback = configObject.analyzerRenderCallback,
            bitRate = configObject.bitRate || 64,
            bufferSize = configObject.bufferSize || 1024,
            chunkLength = configObject.chunkLength || -1;

        var audioContext = new AudioContext(),
            audioInput = null,
            realAudioInput = null,
            inputPoint = null,
            thisChunkId = 0,
            thisChunkStartTime = -1,
            rafID;

        var encoderWorker  = undefined;
        var processor = audioContext.createScriptProcessor(bufferSize, 2, 2);

        var stopRecording = function () {
            if(!encoderWorker){
                setTimeout(stopRecording, 10);
                return;
            }


            processor.onaudioprocess = null;
            encodeChunk(true);
        };

        var startRecording = function () {
            if(!inputPoint){
                setTimeout(startRecording, 10);
                return;
            }

            thisChunkStartTime = Date.now();
            thisChunkId = 0;
            startNewWorker();

            if (!encoderWorker)
                throw "There was a problem creating the audio recorder worker !!!";

            inputPoint.connect(processor);
            processor.connect(audioContext.destination);

            processor.onaudioprocess = function (event) {
                haveAudioSample(
                    {
                        leftBuffer : event.inputBuffer.getChannelData(0),
                        rightBuffer: event.inputBuffer.getChannelData(1)
                    }
                );
            };
        };

        function updateAnalysers(time) {
            analyzerRenderCallback(time, analyserNode);
            rafID = window.requestAnimationFrame(updateAnalysers);
        }

        function haveAudioSample(buffers) {
            var currentTime = Date.now();
            var currentChunkLength = currentTime - thisChunkStartTime;

            if (chunkLength > 0 && currentChunkLength >= (chunkLength * 1000)) {
                thisChunkStartTime = currentTime;
                encodeChunk(false);
                thisChunkId++;
                startNewWorker();
            }

            encoderWorker.postMessage({
                command: 'capture',
                buffers: [
                    buffers.leftBuffer,
                    buffers.rightBuffer
                ]
            });
        };

        function encodeChunk(isLastChunk) {
            encoderWorker.postMessage({command: 'encode', id: thisChunkId, isLastChunk: isLastChunk});
        }

        function gotStream(stream) {
            inputPoint = audioContext.createGain();

            // Create an AudioNode from the stream.
            realAudioInput = audioContext.createMediaStreamSource(stream);
            audioInput = realAudioInput;
            audioInput.connect(inputPoint);

            analyserNode = audioContext.createAnalyser();
            analyserNode.fftSize = 2048;
            inputPoint.connect(analyserNode);


            zeroGain = audioContext.createGain();
            zeroGain.gain.value = 0.0;
            inputPoint.connect(zeroGain);
            zeroGain.connect(audioContext.destination);
            updateAnalysers();
        }

        function receiveWorkerMessage(message) {
            switch (message.data.command) {
                case 'finishedEncoding':
                    finishRecordCallback(message.data.blob, message.data.id, message.data.isLastChunk);
                    break;
                default:
                    throw 'audioRecorder received an unknown message received from audioRecorderWorker: ' + JSON.stringify(message);
            }

        }

        function startNewWorker() {
            encoderWorker = new Worker('js/recording_audio/audioRecorderWorker.js');

            if (!encoderWorker)
                throw "There was a problem creating the audio recorder worker !!!";

            encoderWorker.onmessage = receiveWorkerMessage;

            encoderWorker.postMessage({
                command: 'start',
                sampleRate: audioContext.sampleRate,
                bitRate: bitRate,
                id: thisChunkId
            });
        }

        function init() {
            navigator.getUserMedia({
                    "audio": true,
                    "optional": []
                },
                gotStream,
                function (e) {
                    alert('Error getting audio');
                    console.log(e);
                });
        }

        // Start the ball rolling
        init();

        // Return an object that exposes methods for controlling the recorder
        return {
            start: startRecording,
            stop: stopRecording
        };
}
