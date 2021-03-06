# node-chattingroom

## 例子(example)
[聊天室,chattingroom](http://123.207.175.208:8008/)

## 涉及到的技术(related items)
* node.js
* express
* socket.io
* mysql
* cookie
* html

***

## 目前实现的功能(Current functions)：
* 文字，表情，文件的传输功能(word,emoji,file transimmision)。
* 用户进入，退出的系统广播，总用户数的记录(broadcast of users' in and out)。
* 新消息提醒(new message reminder)
* 用数组来记录用户名，防止重复(ID control)。
* mysql数据库实现用户名管理，提供登录和注册(signin and signup)。
* 支持未读聊天记录的查看(Unread record)。
* 使用cookie保持登录状态的记忆(cookie)。

***

## 之后要做的事情(To do)
* 未读聊天记录的逻辑还有问题，目前只是两个用户之间可以实现，多用户还没实现
* 查看当前在线用户的昵称(目前只能看人数)。
* 实现单独对话（socket.io namespace）
* 引入redis数据库，提升现有cookie的安全性和灵活性
* 用一些前端框架，把界面做的更好看一些
* 增加浏览器兼容性

***

## 使用(For use)
* 安装node环境(Install node)
* git clone https://github.com/startprogress/node-chattingroom.git
* 用database.sql在MySQL中创建数据库和数据表(Use database.sql to create database and datatable in MySQL)
* cd node-chattingroom
* npm install 
* node server.js
