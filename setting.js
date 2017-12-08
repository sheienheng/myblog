//数据库配置信息
module.exports = {
    cookieSecret:'lcc',//加密cookie使用的字符串
    db:'blog',//数据库的名称
    host:'localhost',//数据库的地址
    port:27017//数据库的端口号
}
//我们把数据库的配置信息卸载这里，是为了在连接数据库的时候
//一旦数据库的地址或者名称或者端口号发生变化时，我们只需要改这里