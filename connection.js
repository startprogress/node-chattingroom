/**
 * Created by zhb on 2016/10/7.
 */
var mysql = require('mysql');
var connectionpool = mysql.createPool({
    host : '127.0.0.1',
    user : 'root',
    password : '123456',
    database : 'user'
});
module.exports = connectionpool;

