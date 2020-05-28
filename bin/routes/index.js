var express = require('express');
var router = express.Router();
var expressWs = require('express-ws');
expressWs(router);
/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    message:true
  })
});
router.ws('/echo',function(ws,req){
  ws.on('message',function(msg){
    ws.send(msg);
  })
})
module.exports = router;
