var express = require('express');
const app = express();
const  expressWs  = require("express-ws");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var videoRouter = require('./routes/oldvideo');
var path = require('path');
expressWs(app);
app.use(express.static(path.join(__dirname, "public")));
app.use(function (err, req, res, next) {
  console.error("err---", err);
  next(err);
});
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", " 3.2.1");
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});
app.use("/mobile", indexRouter);
app.use("/logcat", usersRouter);
app.use("/video", videoRouter);
app.get("*", (req, res) => { });
app.listen(4001, () => {
  console.log("server is listening on port 4001");
});
