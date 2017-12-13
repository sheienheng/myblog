var mongodb = require('./db');
//创建一个构造函数，命名为User，里面的username，password，email分别为用户名，密码和邮箱
function User(user) {
    this.username = user.username;
    this.password = user.password;
    this.email = user.email;
}

User.prototype.save = function (callback) {
    var user = {
        username:this.username,
        password:this.password,
        email:this.email
    }
    mongodb.open(function (err,db) {
        //如果在打开数据库是发生错误，将错误结果返回
        if(err){
            return callback(err);
        }
        db.collection('users',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            //将数据插入users集合中去
            collection.insert(user,{safe:true},function (err,user) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,user);
            })
        })
    })
}
User.get = function (username,callback) {
    // 1.打开数据库
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('users',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            //查询name为指定用户名的用户信息，将结果返回
            collection.findOne({username:username},function (err,user) {
                mongodb.close();//关掉数据库
                if(err){
                    return callback(err);
                }
                return callback(null,user);
            })
        })

    })
}
module.exports = User;