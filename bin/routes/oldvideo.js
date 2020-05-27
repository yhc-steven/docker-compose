var express = require('express');
var router = express.Router();
var expressWs = require('express-ws');
//ffmepg demo stream
var ffmpeg = require('fluent-ffmpeg');
var stream = require('stream');
var fs = require('fs');
var path = require('path');
const Splitter = require("stream-split");
const websocketStream = require('websocket-stream/stream');
expressWs(router);
router.get('/', function (req, res, next) {
    console.log(444);
});
const frames = ['./1.png', './1.png', './1.png', './1.png']
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
        // const makeStream = (bf)=>{
        //     fs.writeFile('input.png',bf,function(){
                ffmpeg()
                    .input(fs.createReadStream(path.join(__dirname, '../trailer.mp4')))
                    // .addOption('preset', 'superfast')
                    .videoBitrate('512k')
                    .videoCodec('libx264')
                    .fps(25)
                    // .videoBitrate(100000)
                    .size('1280x720')
                    .format('rawvideo')
                    // .outputOptions(['-movflags faststart', '-vprofile baseline', '-pix_fmt yuv420p', '-tune zerolatency'])
                    .outputOptions([ '-vprofile baseline', '-pix_fmt yuv420p', '-tune zerolatency'])
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
                });
    } catch (error) {
        console.error("error---", error);
    }
})
module.exports = router;