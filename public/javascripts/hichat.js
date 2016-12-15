window.onload = function() {
    var chat = new Chat();
    var realuser = '';
    chat.init();
};
var Chat = function() {
    this.socket = null;
};
Chat.prototype = {
    init: function() {
        var that = this;
        this.socket = io.connect();
        this.socket.on('connect', function() {
            document.getElementById('info').textContent = '欢迎';
            document.getElementById('inorup').style.display = 'block';
        });
        // The wrong cases
        this.socket.on('wrongpsword', function() {
            document.getElementById('info').textContent = '密码错误，请重新输入';
        });
        this.socket.on('mysqlwrong', function() {
            document.getElementById('info').textContent = '系统维护中，请稍后登录';
        });
        this.socket.on('wronguserid', function() {
            document.getElementById('info').textContent = '用户名不存在，请核实';
        });
        this.socket.on('useridexisted', function() {
            document.getElementById('info').textContent = '用户名已存在，请重新选择用户名';
        });
        this.socket.on('norelogin', function() {
            document.getElementById('info').textContent = '已登录,请勿重复登录!';
        });
        // 登录成功
        this.socket.on('loginSuccess', function(history, nickname) {
            realuser =  nickname;
            document.title =  nickname;
            // 之前没有cookie才加入
            document.cookie = "name=" + nickname  + ";max-age=" + (60*60*24*7);
            //登录模块消失，进入聊天，文字输入框获取焦点事件
            document.getElementById('loginWrapper').style.display = 'none';
            strs=history.split("\n"); //字符分割
            var msgtoberead = [];
            for (i=0;i<strs.length ;i++ )
            {
                if (strs[i].indexOf('[未读]') > -1 && strs[i].indexOf(realuser) == -1 ){
                    msgtoberead.push("<p>" + strs[i] + "</p>");
                }
            }
            toshow = msgtoberead.join('\n');
            document.getElementById('historyMsg').innerHTML = toshow;
            document.getElementById('messageInput').focus();
            tochange =  msgtoberead.join('\n').replace(/<p>/g,'').replace(/<\/p>/g,'');
            that.socket.emit('updatelog', tochange);
        });
        this.socket.on('error', function(err) {
            if (document.getElementById('loginWrapper').style.display == 'none') {
                document.getElementById('status').textContent = '无法连接';
            } else {
                document.getElementById('info').textContent = '无法连接';
            }
        });

        this.socket.on('system', function(nickName, userCount, type) {
            var msg = nickName + (type == 'login' ? ' joined' : ' left');
            that._displayNewMsg('system ', msg, 'red');
            document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
        });

        // titleblink,用于document.title的闪烁
        var titleblink = {
            time: 0,
            timer: null,
            // 显示新消息提示
            show: function () {
                // 定时器，设置消息切换频率闪烁效果就此产生
                titleblink.timer = setTimeout(function () {
                    titleblink.time++;
                    titleblink.show();
                    if (titleblink.time % 2 == 0) {
                        document.title = "【新消息】" + realuser;
                    }
                    else {
                        document.title = "【　　　】" + realuser;
                    };
                }, 100);
                return [titleblink.timer];
            },
            clear: function () {
                clearTimeout(titleblink.timer);
            }
        };
        //收到新消息
        this.socket.on('newMsg', function(user, msg, color) {
            that._displayNewMsg(user, msg, color);
            var hiddenProperty = 'hidden' in document ? 'hidden' : 'webkitHidden' in document ? 'webkitHidden' : 'mozHidden' in document ? 'mozHidden' :   null;
            if (document[hiddenProperty]) {
                titleblink.show();
            }
        });
        //收到新图片
        this.socket.on('newImg', function(user, img, color) {
            that._displayImage(user, img, color);
            var hiddenProperty = 'hidden' in document ? 'hidden' : 'webkitHidden' in document ? 'webkitHidden' : 'mozHidden' in document ? 'mozHidden' :   null;
            if (document[hiddenProperty]) {
                titleblink.show();
            }
        });
        // 退出
        document.getElementById('exit').addEventListener('click', function() {
            //删除cookie
            document.cookie = "name=";
            // reload html
            window.location.reload();
        }, false);
        // 数据库控制登录和注册
        document.getElementById('signinBtn').addEventListener('click', function() {
            document.getElementById('inorup').style.display = 'none';
            document.getElementById('signinInfo').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        }, false);
        document.getElementById('signupBtn').addEventListener('click', function() {
            document.getElementById('inorup').style.display = 'none';
            document.getElementById('signupInfo').style.display = 'block';
            document.getElementById('createnickname').focus();
        }, false);
        document.getElementById('signinreturn').addEventListener('click', function() {
            document.getElementById('inorup').style.display = 'block';
            document.getElementById('signinInfo').style.display = 'none';
        }, false);
        document.getElementById('signupreturn').addEventListener('click', function() {
            document.getElementById('inorup').style.display = 'block';
            document.getElementById('signupInfo').style.display = 'none';
        }, false);
        //登录模块逻辑
        document.getElementById('signin').addEventListener('click', function() {
            var nickName = document.getElementById('nicknameInput').value;
            var nicknamepsword =  document.getElementById('nicknamepsword').value;
            var type = 'in';
            if (nickName.trim().length != 0  || nicknamepsword.trim().length != 0) {
                that.socket.emit('login', nickName, nicknamepsword, type);
            } else {
                document.getElementById('nicknameInput').focus();
                alert('请填写用户名和密码');
            };
        }, false);
        document.getElementById('nicknamepsword').addEventListener('keyup', function(e) {
            if (e.keyCode == 13) {
                var nickName = document.getElementById('nicknameInput').value;
                var nicknamepsword =  document.getElementById('nicknamepsword').value;
                var type = 'in';
                if (nickName.trim().length != 0  || nicknamepsword.trim().length != 0) {
                    that.socket.emit('login', nickName, nicknamepsword, type);
                }else{
                    document.getElementById('nicknameInput').focus();
                    alert('请填写用户名和密码');
                }
            };
        }, false);
        //注册模块逻辑
        document.getElementById('signup').addEventListener('click', function() {
            var nickName = document.getElementById('createnickname').value;
            var nicknamepsword =  document.getElementById('pswordfirst').value;
            var pswordconfirm = document.getElementById('pswordsecond').value;
            var type = 'up';
            if (nickName.trim().length == 0  || nicknamepsword.trim().length == 0 || pswordconfirm.trim().length == 0) {
                document.getElementById('nicknameInput').focus();
                alert('请补全所需内容');

            } else if( nicknamepsword.trim() != pswordconfirm.trim()) {
                document.getElementById('nicknameInput').focus();
                alert('两次密码不一致，请重新填写');
            }else{
                that.socket.emit('login', nickName, nicknamepsword, type);
            }
        }, false);
        document.getElementById('pswordsecond').addEventListener('keyup', function(e) {
            if (e.keyCode == 13) {
                var nickName = document.getElementById('createnickname').value;
                var nicknamepsword =  document.getElementById('pswordfirst').value;
                var pswordconfirm = document.getElementById('pswordsecond').value;
                var type = 'up';
                if (nickName.trim().length == 0  || nicknamepsword.trim().length == 0 || pswordconfirm.trim().length == 0) {
                    document.getElementById('nicknameInput').focus();
                    alert('请补全所需内容');

                } else if( nicknamepsword.trim() != pswordconfirm.trim()) {
                    document.getElementById('nicknameInput').focus();
                    alert('两次密码不一致，请重新填写');
                }else{
                    that.socket.emit('login', nickName, nicknamepsword, type);
                }
            };
        }, false);

        //页面是否隐藏,如果当前浏览则显示用户名
        var hiddenProperty = 'hidden' in document ? 'hidden' : 'webkitHidden' in document ? 'webkitHidden' : 'mozHidden' in document ? 'mozHidden' :   null;
        var visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
// 标签切换操作
        var onVisibilityChange = function(){
            if (!document[hiddenProperty]) {
                titleblink.clear();
                document.title=realuser;
                // console.log("kan");
            }
            // else{
            //     console.log("bukan");
            // }
        };
        document.addEventListener(visibilityChangeEvent, onVisibilityChange);

        document.getElementById('sendBtn').addEventListener('click', function() {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value.replace(/\n/g,''),
                color = document.getElementById('colorStyle').value;
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg(realuser, msg, color);
                return;
            };
        }, false);
        document.getElementById('messageInput').addEventListener('keyup', function(e) {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value.replace(/\n/g,''),
                color = document.getElementById('colorStyle').value;
            if (e.keyCode == 13 && msg.trim().length != 0) {
                messageInput.value = '';
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg(realuser, msg, color);
            };
        }, false);
        document.getElementById('clearBtn').addEventListener('click', function() {
            document.getElementById('historyMsg').innerHTML = '';
        }, false);
        document.getElementById('sendImage').addEventListener('change', function() {
            if (this.files.length != 0) {
                var file = this.files[0],
                    reader = new FileReader(),
                    color = document.getElementById('colorStyle').value;
                if (!reader) {
                    that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
                    this.value = '';
                    return;
                };
                reader.onload = function(e) {
                    this.value = '';
                    that.socket.emit('img', e.target.result, color);
                    that._displayImage(realuser, e.target.result, color);
                };
                reader.readAsDataURL(file);
            };
        }, false);
        this._initialEmoji();
        document.getElementById('emoji').addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            emojiwrapper.style.display = 'block';
            e.stopPropagation();
        }, false);
        document.body.addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if (e.target != emojiwrapper) {
                emojiwrapper.style.display = 'none';
            };
        });
        document.getElementById('emojiWrapper').addEventListener('click', function(e) {
            var target = e.target;
            if (target.nodeName.toLowerCase() == 'img') {
                var messageInput = document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
            };
        }, false);
    },
    _initialEmoji: function() {
        var emojiContainer = document.getElementById('emojiWrapper'),
            docFragment = document.createDocumentFragment();
        for (var i = 42; i > 0; i--) {
            var emojiItem = document.createElement('img');
            emojiItem.src = '../content/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        };
        emojiContainer.appendChild(docFragment);
    },
    _displayNewMsg: function(user, msg, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8),
            //determine whether the msg contains emoji
            msg = this._showEmoji(msg);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">[' + date + ']: </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _displayImage: function(user, imgData, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">[' + date + ']: </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _showEmoji: function(msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');//todo:fix this in chrome it will cause a new request for the image
            };
        };
        return result;
    }
};
