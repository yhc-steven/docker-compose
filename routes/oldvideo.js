var express = require('express');
var router = express.Router();
var expressWs = require('express-ws');
//ffmepg demo stream
var ffmpeg = require('fluent-ffmpeg');
var stream = require('stream');
const Splitter = require("stream-split");
const websocketStream = require('websocket-stream/stream');
expressWs(router);
router.get('/', function (req, res, next) {
    console.log(444);
});
const NALseparator = Buffer.from([0, 0, 0, 1]);
const split = new Splitter(NALseparator);
router.ws('/', function (ws, req) {
    try {
        ws.binaryType = "arraybuffer";
        ws.send(
            JSON.stringify({
                action: "init",
                width: 1280,
                height: 720,
            })
        );
        var proc = ffmpeg('./trailer.mp4')
            .videoCodec('libx264')
            .fps(15)
            .videoBitrate(50000)
            .size('1280x720')
            .format('rawvideo')
            .outputOptions('-vprofile baseline')
            .output(new stream.Transform({
                transform: function (chunk, encoding, callback) {
                    split.write(chunk);
                    callback();
                }
            }))
            .on('error', function (err) {
                console.log('An error occurred: ' + err.message);
            })
            .on('end', function () {
                console.log('Processing finished !');
            }).run();
        split.on("data", function (chunk) {
            ws.send(Buffer.concat([NALseparator, chunk]), { binary: true })
        })
    } catch (error) {
        console.error("error---", error);
    }
})
module.exports = router;