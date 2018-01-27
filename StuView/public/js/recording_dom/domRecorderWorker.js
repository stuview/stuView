self.importScripts('whammy.js');

var encoder;
var id;

onmessage = function (message) {
    var messageData = message.data;

    switch (messageData.command) {
        case 'start':
            id = messageData.id;
            encoder = new (Whammy()).Video(messageData.frameRate, 1.0);
            break;
        case 'capture':
            encoder.add(messageData.image);
            break;
        case 'encode':
            encoder.compile(
                [],
                function (data) {
                    self.postMessage({command: 'finishedEncoding', data: data, id: id, isLastChunk: messageData.isLastChunk});
                    encoder.reset();
                    encoder = null;
                    close();
                });
            break;
    }
};
