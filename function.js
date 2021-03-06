var logger = require('./log').logger('normal');
var users = [];
var fs = require('fs');
var connectionpool = require('./connection');
module.exports = function(socket) {
    var io =require('./server').io;
    var localcookie = socket.request.headers.cookie;
    if (localcookie !== undefined && localcookie.substring(localcookie.indexOf("name=")+5).length > 0){
        //防止重复登录
        var testuser = localcookie.substring(localcookie.indexOf("name=")+5);
        if (users.indexOf(testuser.trim()) > -1){
            socket.emit('norelogin');
        }else{
            var testSql = 'SELECT userid from userinfo where userid = ?';
            var testparams = [testuser];
            connectionpool.getConnection(function(err, connection) {
                if (err) {
                    socket.emit("mysqlwrong");
                } else {
                    connection.query(testSql, testparams, function (err, rows) {
                        if (err) {
                            socket.emit("mysqlwrong");
                        } else {
                            if (rows.length != 0) {
                                users.push(testuser);
                                date = new Date().toLocaleString();
                                logger.info(testuser + '[IN] at ' + date);
                                //socket.userIndex = users.length;
                                socket.nickname = testuser;
                                var history = fs.readFileSync("record.txt", "utf-8");
                                socket.emit('loginSuccess', history, testuser);
                                io.sockets.emit('system', testuser, users.length, 'login');
                            }
                        }
                    });
                }
            });
        }
    }
    // no cookie, use login(separated by type in or up)
    socket.on('login', function(nickname, nicknamepsword, type) {
        if (users.indexOf(nickname.trim()) > -1){
            socket.emit('norelogin');
        }else{
            if (type == 'in'){
                var querySql = 'SELECT psword from userinfo where userid = ?';
                var queryparams = [nickname];
                connectionpool.getConnection(function(err, connection) {
                    if (err) {
                        socket.emit("mysqlwrong");
                    } else {
                        connection.query(querySql, queryparams, function(err, rows) {
                            if (err) {
                                socket.emit("mysqlwrong");
                            }else {
                                if (rows.length == 0) {
                                    socket.emit('wronguserid');
                                } else {
                                    if (nicknamepsword == rows[0].psword) {
                                        users.push(nickname);
                                        date = new Date().toLocaleString();
                                        logger.info(nickname + '[IN] at ' + date);
                                        //socket.userIndex = users.length;
                                        socket.nickname = nickname;
                                        //chatting record
                                        var history = fs.readFileSync("record.txt", "utf-8");
                                        socket.emit('loginSuccess', history, nickname);
                                        io.sockets.emit('system', nickname, users.length, 'login');
                                    } else {
                                        socket.emit('wrongpsword');
                                    }
                                }
                            }
                        });
                        connection.release();
                    }
                });
            }
            // log up
            if (type == 'up'){
                var querySql = 'INSERT INTO userinfo(userid, psword) VALUES(?,?);';
                var queryparams = [nickname, nicknamepsword];
                var testSql = 'SELECT * from userinfo where userid = ?';
                var testparams = [nickname];
                connectionpool.getConnection(function(err, connection) {
                    if (err) {
                        socket.emit("mysqlwrong");
                    } else {
                        connection.query(testSql, testparams, function(err, rows) {
                            if (err) {
                                socket.emit("mysqlwrong");
                            }else {
                                if (rows.length != 0){
                                    socket.emit("userisexisted");
                                }else{
                                    connection.query(querySql, queryparams, function(err, result) {
                                        if (err) {
                                            socket.emit("mysqlwrong");
                                        }else {
                                            users.push(nickname);
                                            date = new Date().toLocaleString( );
                                            logger.info(nickname + '[IN] at ' + date);
                                            //socket.userIndex = users.length;
                                            socket.nickname = nickname;
                                            var history = fs.readFileSync("record.txt","utf-8");
                                            socket.emit('loginSuccess',history, nickname);
                                            io.sockets.emit('system', nickname, users.length, 'login');
                                        }
                                    });
                                }
                            }
                        });
                        connection.release();
                    }
                });
            }
        }
    });
    //user leaves by close the web page, disconnect.
    socket.on('disconnect', function() {
        if (socket.nickname != null) {
            for(i=0;i<users.length;i++){
                if (users[i] === socket.nickname){
                    users.splice(i, 1);
                    break;
                }
            }
            date = new Date().toLocaleString();
            logger.info(socket.nickname + '[OUT] at' + date);
            socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
        }
    });

    // update the record.txt after sb check the unread message
    socket.on('updatelog', function(tochange){
        var oldlog = fs.readFileSync("record.txt","utf-8").split('\n');
        var changing = tochange.split('\n');
        for (i=0;i<changing.length ;i++ )
        {
            var location = oldlog.indexOf(changing[i]);
            oldlog[location] = oldlog[location].replace('[未读]', '');
        }
        fs.writeFileSync("record.txt", oldlog.join('\n'));
    });

    //new message get
    socket.on('postMsg', function(msg, color) {
        msg = msg.replace(/\n/g,'');
        if (msg !== ''){
            socket.broadcast.emit('newMsg', socket.nickname, msg, color);
            date = new Date().toLocaleString( );
            var msgtowrite = '';
            msg = msg.replace('\n','');
            if (users.length == 1){
                msgtowrite = '[未读]' + socket.nickname + '[' + date  + ']' + ': ' + msg + '\n';
            }else {
                msgtowrite = socket.nickname + '[' + date  + ']' + ': ' + msg + '\n';
            };
            fs.appendFile('record.txt', msgtowrite, function (err) {
                if (err) throw err;
            });
            //fs.appendFileSync("record.txt", msgtowrite);
        };
    });
    //new image get
    socket.on('img', function(imgData, color) {
        socket.broadcast.emit('newImg', socket.nickname, imgData, color);
    });
};
