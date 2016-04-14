// Simple ffmpeg web worker based on (https://github.com/bgrins/videoconverter.js/blob/master/demo/worker.js)

importScripts('ffmpeg.js');

function print(text) {
    postMessage({
        'type' : 'stdout',
        'data' : text
    });
}

function printErr(text) {
    postMessage({
        'type' : 'stderr',
        'data' : text
    });
}
var now = Date.now;
importScripts('ffmpeg.js');

onmessage = function(event) {

  var message = event.data;

  if (message.type === "command") {

    var Module = {
      print: print,
      printErr: print,
      files: message.files || [],
      arguments: message.arguments || [],
      TOTAL_MEMORY: message.TOTAL_MEMORY || false
      // Can play around with this option - must be a power of 2
      // TOTAL_MEMORY: 268435456
    };

    postMessage({
      'type' : 'start',
      'data' : Module.arguments.join(" ")
    });

    postMessage({
      'type' : 'stdout',
      'data' : 'Received command: ' +
                Module.arguments.join(" ") +
                ((Module.TOTAL_MEMORY) ? ".  Processing with " + Module.TOTAL_MEMORY + " bits." : "")
    });

    var time = now();
    var result = ffmpeg_run(Module);

    var totalTime = now() - time;
    postMessage({
      'type' : 'stdout',
      'data' : 'Finished processing (took ' + totalTime + 'ms)'
    });

    postMessage({
      'type' : 'done',
      'data' : result,
      'time' : totalTime
    });
  }
};

// ffmpeg loaded
postMessage({
    'type' : 'ready'
});
