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
    var mergedVideo = ffmpeg();
    var videoNames = ['./trailer.mp4', './trailer.mp4'];
    videoNames.forEach(function (videoName) {
        mergedVideo = mergedVideo.addInput(videoName);
    });
    mergedVideo.mergeToFile('./mergedVideo.mp4', './tmp/')
        .on('error', function (err) {
            console.log('Error ' + err.message);
        })
        .on('end', function () {
            console.log('Finished!');
        });
})
module.exports = router;