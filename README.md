# node-chattingroom

## 例子(example)
[聊天室,chattingroom](http://test.andrewzhang.cn/)

## 涉及到的技术
* node.js
* express
* socket.io
* mysql
* cookie
* html

***

## 目前实现的功能：
* 文字，表情，文件的传输功能。
* 用户进入，退出的系统广播，总用户数的记录。
* 用数组来记录用户名，防止重复。
* mysql数据库实现用户名管理，提供登录和注册。
* 支持未读聊天记录的查看。
* 使用cookie保持登录状态的记忆。

***

## 之后要做的事情
* 未读聊天记录的逻辑还有问题，目前只是两个用户之间可以实现，多用户还没实现。
* 查看当前在线用户的昵称(目前只能看人数)。
* 实现单独对话（socket.io namespace）
* 引入redis数据库，提升现有cookie的安全性和灵活性

***

## 使用
* 安装node环境
* git clone https://github.com/startprogress/node-chattingroom.git
* cd node-chattingroom
* npm install 
* node server.js
