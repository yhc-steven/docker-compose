var express = require('express');
var child_process = require('child_process');
var router = express.Router();
var expressWs = require('express-ws');
var fs = require('fs');
var stream = require('stream');
var path = require('path');
var ffmpeg = require('fluent-ffmpeg');
const Splitter = require("stream-split");
const websocketStream = require('websocket-stream/stream');
const { fstat } = require('fs');
expressWs(router);
router.get('/', function (req, res, next) {
    console.log(444);
});
const NALseparator = Buffer.from([0, 0, 0, 1]);
router.ws('/', function (ws, req) {
    try {
        ws.binaryType = "arraybuffer";
        ws.send(
            JSON.stringify({
                action: "init",
                width: 864,
                height: 480,
            })
        );

        var input_file = fs.createReadStream('./trailer.mp4');
        input_file.on('error', function (err) {
            console.log(err);
        });
        // var ffmpeg = child_process.spawn('ffmpeg', [
        //     '-i', 'pipe:0',
        //     "-framerate", 30,
        //     "-video_size", '1280x720',
        //     '-pix_fmt', 'yuv420p',
        //     '-c:v', 'libx264',
        //     '-b:v', '100000',
        //     '-bufsize', '100000',
        //     '-vprofile', 'baseline',
        //     '-tune', 'zerolatency',
        //     '-f', 'rawvideo', 
        //     '-movflags', 'frag_keyframe', 
        //     'pipe:1']);
        
        // Launch FFmpeg to handle all appropriate transcoding, muxing, and RTMP
        const ffmpeg = child_process.spawn('ffmpeg', [
            // '-i', './output.mp4',
            // '-i', 'pipe:0',
            '-i', '-',
            '-y',
            '-f', 'mp4',
            "-framerate", 30,
            "-video_size", '1280x720',
            '-pix_fmt', 'yuv420p',
            '-c:v', 'libx264',
            '-b:v', '100000',
            '-bufsize', '100000',
            '-vprofile', 'baseline',
            '-tune', 'zerolatency',
            '-f', 'rawvideo',
            '-y', 'pipe:1'
        ]);
        input_file.pipe(ffmpeg.stdin);
        ffmpeg.on('close', (code, signal) => {
            console.log('FFmpeg child process closed, code ' + code + ', signal ' + signal);
            ws.terminate();
        });
        const webStream = websocketStream(ws, {
            binary: true,
        });
        // Handle STDIN pipe errors by logging to the console.
        // These errors most commonly occur when FFmpeg closes and there is still
        // data to write.  If left unhandled, the server will crash.
        ffmpeg.stdin.on('error', (e) => {
            console.log('FFmpeg STDIN Error', e);
        });
        ffmpeg.stdout.pipe(new Splitter(NALseparator)).pipe(
            new stream.Transform({
                transform: function (chunk, encoding, callback) {
                    const chunkWithSeparator = Buffer.concat([NALseparator, chunk]);
                    this.push(chunkWithSeparator);
                    callback();
                }
            })
        ).pipe(webStream);
        // FFmpeg outputs all of its messages to STDERR.  Let's log them to the console.
        
        ffmpeg.stderr.on('data', (data) => {
            console.log('FFmpeg STDERR:', data.toString());
        });
        
        // When data comes in from the WebSocket, write it to FFmpeg's STDIN.
        ws.on('message', (msg) => {
            console.log('DATA', msg);
            // ffmpeg.stdin.write(msg);
        });
        fs.createReadStream(path.join(__dirname, '../output.mp4')).pipe(ffmpeg.stdin, { end: false })
        // If the client disconnects, stop FFmpeg.
        ws.on('close', (e) => {
            ffmpeg.kill('SIGINT');
        });

    } catch (error) {
        console.error("error---", error);
    }
})
module.exports = router;