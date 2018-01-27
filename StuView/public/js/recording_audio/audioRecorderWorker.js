self.importScripts('lame.min.js');


var buffers = undefined,
    encoder = undefined,
    id,
    dataBuffer = [],
    sampleCount = 0,
    encodeSize = 1152;

var appendToBuffer = function (mp3Buf) {
    dataBuffer.push(new Int8Array(mp3Buf));
};


self.onmessage = function (message) {
    var messageData = message.data;

    switch (messageData.command) {
        case 'start':
            encoder = new lamejs.Mp3Encoder(2, messageData.sampleRate, messageData.bitRate);
            id = messageData.id;
            buffers = [];
            break;
        case 'capture':
            buffers.push(messageData.buffers.map(function(element){
                var length = element.length;
                var output = new Int16Array(length);
                for(var i = 0; i < length; ++i){
                    output[i] = parseInt(16384 * element[i]);
                }
                sampleCount += length;

                return output;
            }));
            break;
        case 'encode':

            sampleCount /=2;

            while(buffers.length > 0) {
                var thisSet = buffers.shift();
                appendToBuffer(encoder.encodeBuffer(thisSet[0], thisSet[1]));
            }

            appendToBuffer(encoder.flush());
            var thisBlob = new Blob(dataBuffer, {type: 'audio/mp3'});

            self.postMessage({
                command: 'finishedEncoding',
                blob: thisBlob,
                isLastChunk: messageData.isLastChunk,
                id: id
            });
            encoder = undefined;
            close();
            break;
    }
};
