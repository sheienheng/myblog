var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//引入数据库配置文件
var setting = require('./setting');
var flash = require('connect-flash');
var session = require('express-session');
//session存放数据库的插件
var MongoStore = require('connect-mongo')(session);

//添加路由文件
var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));//打印日志
app.use(bodyParser.json());//解析成JSON格式
app.use(bodyParser.urlencoded({ extended: false }));//
app.use(cookieParser());//处理cookie
app.use(express.static(path.join(__dirname, 'public')));
//使用flash
app.use(flash());
//使用session
app.use(session({
    //加密
    secret:setting.cookieSecret,
    cookie:{maxAge:1000*60*60*24*30},
    //加密
    key:setting.db,
    //连接数据库地址
    store:new MongoStore({
        url:'mongodb://localhost/blog'
    }),
    //是否强制保存会话
    resave:flash,
    //会话未修改时，是否保存
    saveUninitialized:true
}));

//将app传递给路由函数使用
routes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);//设置状态码
  res.render('error');
});
//添加监听
app.listen(3000,function () {
    console.log("node is OK");
})
module.exports = app;//导出
