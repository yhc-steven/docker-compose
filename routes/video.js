var express = require('express');
var child_process = require('child_process');
var router = express.Router();
var expressWs = require('express-ws');
//ffmepg demo stream
var stream = require('stream');
var ffmpeg = require('fluent-ffmpeg');
const Splitter = require("stream-split");
const websocketStream = require('websocket-stream/stream');
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
        let match;
        // Launch FFmpeg to handle all appropriate transcoding, muxing, and RTMP
        const ffmpeg = child_process.spawn('ffmpeg', [
            '-i', './output.mp4',
            "-framerate", 15,
            "-video_size", '1280x720',
            '-pix_fmt', 'yuv420p',
            '-c:v', 'libx264',
            '-b:v', '800k',
            '-bufsize', '800k',
            '-vprofile', 'baseline',
            '-vlevel','4.0',
            '-tune', 'zerolatency',
            '-f', 'rawvideo',
            '-y', 'pipe:1'
        ]);
        // "-i", "video=Integrated Webcam",
        //     "-framerate", this.options.fps,
        //     "-video_size", this.options.width + 'x' + this.options.height,
        //     '-pix_fmt', 'yuv420p',
        //     '-c:v', 'libx264',
        //     '-b:v', '600k',
        //     '-bufsize', '600k',
        //     '-vprofile', 'baseline',
        //     '-tune', 'zerolatency',
        //     '-f', 'rawvideo',
        //     '-'
        // If FFmpeg stops for any reason, close the WebSocket connection.
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

        // If the client disconnects, stop FFmpeg.
        ws.on('close', (e) => {
            ffmpeg.kill('SIGINT');
        });

    } catch (error) {
        console.error("error---", error);
    }
})
module.exports = router;