//引入User.js集合操作方法
var User = require('../model/User');
var Post = require('../model/Post');
//字段
var Comment = require('../model/comment');
var crypto = require('crypto');
//引入上穿的插件
var multer = require('multer');
//配置信息
var storage = multer.diskStorage({
    destination:function(req,file,cb) {
        cb(null,'./public/images');
    },
    filename:function(req,file,cb) {
        cb(null,file.originalname);
    }
})
var upload = multer({storage:storage});
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
        Post.getAll(null, function (err,docs) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: '主页',
                user: req.session.user,
                docs: docs,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
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
        var currentName = req.session.user;
        var post = new Post(currentName.username,req.body.title,req.body.content);
        post.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', '发布成功!');
            res.redirect('/');//发表成功跳转到主页
        });

    });
    app.get('/upload',checkLogin,function (req,res) {
        res.render('upload',{
            title:'上传页面',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()

        })
    })
    //多张上传
    // app.post('/upload',upload.array('filename',5),function (req,res) {//upload.array('filename',5)

    //     req.flash('success','上传成功');
    //     return res.redirect('/upload');
    // })
    app.post('/upload',upload.single('filename'),function (req,res) {//upload.array('filename',5)
        var file = req.file;
        console.log('文件类型：', file.mimetype);
        console.log('原始文件名：', file.originalname);
        console.log('文件大小：', file.size);
        console.log('文件保存路径：', file.path);

        req.flash('success','上传成功');

        return res.redirect('/upload');
    })
    //退出
    app.get('/logout',checkLogin,function (req,res) {
        //将session里边的信息清除，并给出提示信息，跳转到首页
        req.session.user = null;
        req.flash('success','退出成功');
        return res.redirect('/');
    });
//    添加一个用户页面  :name说明这个值是动态的
    app.get('/u/:name',function (req,res) {
        //1.检查用户是否存在
        User.get(req.params.name,function (err,user) {
            if(!user){
                req.flash('error','用户不存在');
                return res.redirect('/');
            }
        //    2.查询出name对应的该用户的所有文章
            Post.getAll(user.username,function (err,docs) {
                if(err){
                    req.flash('error',err);
                    res.redirect('/');
                }
                return res.render('user',{
                    title:'用户文章列表',
                    user:req.session.user,
                    success:req.flash('success').toString(),
                    error:req.flash('error').toString(),
                    docs:docs
                })
            })
        })
    })
    app.get('/u/:name/:title/:time',function (req,res) {
        Post.getOne(req.params.name,req.params.title,req.params.time,function (err,doc) {
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            return res.render('article',{
                title:'文章详情列表',
                user:req.session.user,
                success:req.flash('success').toString(),
                error:req.flash('error').toString(),
                doc:doc
            })
        })
    })
//    编辑的页面
    app.get('/edit/:name/:title/:time',checkLogin,function (req,res) {
        Post.edit(req.params.name,req.params.title,req.params.time,function (err,doc) {
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            return res.render('edit',{
                title:'编辑页面',
                user:req.session.user,
                success:req.flash('success').toString(),
                error:req.flash('error').toString(),
                doc:doc
            })
        })
    })
    //编辑修改行为
    app.post('/edit/:name/:title/:time',function (req,res) {
        Post.update(req.params.name,req.params.title,req.params.time,req.body.content,function (err,doc) {
            var url = encodeURI('/u/'+req.params.name+'/'+req.params.title+'/'+req.params.time);
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            req.flash('success','修改成功');
            return res.redirect(url);
        })
    })
    //删除

    app.get('/remove/:name/:title/:time',function (req,res) {
        Post.remove(req.params.name,req.params.title,req.params.time,function (err,doc) {
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            req.flash('success','删除成功');
            return res.redirect('/');
        })
    })
    function formatDate(num) {
        return num < 10 ? '0' + num : num;
    }
    app.post('/comment/:name/:title/:time',function (req,res) {
        console.log(req.body.c_content);
        var date = new Date();
        var now = date.getFullYear()+'年'+formatDate(date.getMonth()+1)+'月'+formatDate(date.getDate())+'日'
            +'  '+formatDate(date.getHours())+':'+formatDate(date.getMinutes())+':'+formatDate(date.getSeconds());
        var comment = {
            c_name:req.session.user.username,
            c_time:now,
            c_content:req.body.c_content
        }
        console.log(comment);
        var newComment = new Comment(req.params.name,req.params.title,req.params.time,comment);
        newComment.save(function (err) {
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            req.flash('success','留言成功');
            return res.redirect('back');
        })
    })
}