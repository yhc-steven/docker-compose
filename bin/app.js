var express = require('express');
const app = express();
const expressWs = require("express-ws");
var indexRouter = require('./routes/index');
var videoRouter = require('./routes/oldvideo');
var logger = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
expressWs(app);
app.use(function (err, req, res, next) {
  console.error("err---", err);
  next(err);
});
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 'extended': 'false' }));
app.set('view engine', 'html');

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.use("/index", indexRouter);
app.use("/video", videoRouter);
app.get("*", (req, res) => { });
app.listen(4001, () => {
  console.log("server is listening on port 4001");
});
