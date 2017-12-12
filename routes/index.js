//引入User.js集合操作方法
var User = require('../model/User');

var crypto = require('crypto');
function checkLogin(req,res,next) {
    if(!req.session.user){
        req.flash('error','未登录');
        return res.redirect('/login');
    }
    next();
}
function checkNotLogin(req,res,next) {
    if(req.session.user){
        req.flash('error','已登录');
        return res.redirect('back');
    }
    next();
}
module.exports = function (app) {
    //首页
    app.get('/',function (req,res) {

        res.render('index',{
            title:'首页页面',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()


        })
    });
    //注册页面
    app.get('/reg',checkNotLogin,function (req,res) {
        res.render('reg',{
            title:'注册页面',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    });
    //注册行为
    app.post('/reg',function (req,res) {
        //1.收集数据
        var username = req.body.username;
        var password = req.body.password;
        var password_repeat = req.body['password_repeat'];//点不支持_

        // 2.判断两次密码是否正确
        if(password != password_repeat){
            req.flash('error','两次密码不一致');
            return res.redirect('/reg');
        }

        //3.对密码进行加密
        var md5 = crypto.createHash('md5');
        password = md5.update(req.body.password).digest('hex');//16进制加密
        var newUser = new User({
            username:username,
            password:password,
            email:req.body.email
        })

        //4.判断用户名是否存在
        User.get(newUser.username,function (err,user) {
            if(err){
                req.flash('error',err);
                return res.redirect('/reg');
            }
            if(user){
                req.flash('error','用户名已存在');
                // console.log(req.flash('error').toString());
                return res.redirect('/reg');
            }

        //5.将用户信息存入数据库,并且跳转到首页
        newUser.save(function (err,user) {
            if(err){
                req.flash('error',err);
                return res.redirect('/reg');
            }
            // req.session.user = newUser;
            req.flash('success','注册成功');
            return res.redirect('/login');
        })
    })
    });
    //登录页面
    app.get('/login',checkNotLogin,function (req,res) {
        res.render('login',{
            title:'登录页面',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    });
    //登录行为
    app.post('/login',function (req,res) {
        //1.对密码进行加密
        //2.判断用户是否存在
        //3.判断密码是否正确
        //4.把用户信息存在session上
        var username = req.body.username;

        var md5 = crypto.createHash('md5');
        password = md5.update(req.body.password).digest('hex');//16进制加密
        User.get(username,function (err,user) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/login');
            }
            if (!user) {
                req.flash('error', '用户名不存在');
                return res.redirect('/login');
            }else{
                if(password == user.password){
                    req.session.user = user;
                    req.flash('success','登录成功');
                    return res.redirect('/');
                }else{
                    req.flash('error','密码错误');
                    return res.redirect('/login');
                }
            }
        })
    });
    //发表页面
    app.get('/post',checkLogin,function (req,res) {
        res.render('post',{
            title:'发表页面',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    });

    //发表行为
    app.post('/post',function (req,res) {


    });
    //退出
    app.get('/logout',checkLogin,function (req,res) {
        //将session里边的信息清除，并给出提示信息，跳转到首页
        req.session.user = null;
        req.flash('success','退出成功');
        return res.redirect('/');
    });
}