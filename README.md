# Note Application 筆記軟體

![banner.png](https://i.postimg.cc/ZRMR75JL/banner.png)

## Demo

https://morning-ridge-97909.herokuapp.com/

## 簡介
利用 Express 及 Firebase 打造 Note Application 筆記軟體，主要特色及功能有：

* 功能
    -   新增/修改/刪除 筆記
    -   收藏/取消收藏 筆記
    -   卡片檢視、列表檢視
    -   響應式設計
    -   帳號管理
    -   筆記本管理

* 特色
    -   利用 Express 應用程式產生器，建立 Web 應用程式，並使用 ejs 樣板語言，生成 HTML 頁面，並利用 Heroku 部署網站
    -   使用 Firebase 驗證功能，管理會員，並建立使用者註冊、登入及登出功能
    -   使用 Firebase Storage 上傳並管理檔案
    -   使用 Firebase Realtime Database，串接 Firebase 資料庫，實現建立、修改、刪除筆記功能
    -   使用 CKEditor 文字編輯套件，在線編輯筆記

## 技術
* Node
* Express
* Firebase Auth
* Firebase Storage
* Firebase Realtime Database
* SCSS
* ESlint

## 內容介紹

### 登入、註冊頁面

* 註冊、登入功能
* 錯誤回饋

![auth.png](https://i.postimg.cc/g0cFrx5k/auth.png)

### 首頁、筆記本頁面

* 收藏筆記、刪除筆記功能、刪除筆記
* 卡片或列表檢視
* 頁碼設計

![banner.png](https://i.postimg.cc/ZRMR75JL/banner.png)

![index-list2.png](https://i.postimg.cc/523Dcx0c/index-list2.png)

### 單獨筆記頁面

* 筆記內容、資訊

![post.png](https://i.postimg.cc/kMLNDnW8/post.png)

### 新增、修改筆記頁面

* 新增、修改筆記
* 上傳筆記封面

![editarticle.png](https://i.postimg.cc/JzNsr8Q1/editarticle.png)

### 筆記本管理頁面

* 新增、刪除筆記本
* 錯誤訊息回饋

![editbooks.png](https://i.postimg.cc/BQ18zHLP/editbooks.png)

### 帳號管理 頁面

* 修改密碼，更新暱稱 功能
* 刪除帳戶 功能

![edituser.png](https://i.postimg.cc/cLyKGCw9/edituser.png)

### 回饋訊息、互動操作

* Loading 效果
![loading.png](https://i.postimg.cc/RFcc80SK/loading.png)

* 回饋訊息
![message.png](https://i.postimg.cc/NMh6pXcQ/message.png)

* 刪除互動操作
![modal.png](https://i.postimg.cc/tg9Y7crF/modal.png)

## 使用套件

* [express-generator](https://github.com/expressjs/generator)
* [firebase-admin](https://github.com/firebase/firebase-admin-node)
* [firebase](https://github.com/firebase/firebase-js-sdk)
* [express-validator](https://github.com/express-validator/express-validator)
* [express-session](https://github.com/expressjs/session)
* [express-ejs-extend](https://github.com/bryanjhv/express-ejs-extend)
* [connect-flash](https://github.com/jaredhanson/connect-flash)
* [striptags](https://github.com/ericnorris/striptags)
* [multer](https://github.com/expressjs/multer)
* [moment](https://github.com/moment/moment)
* [jquery](https://jquery.com/)
* [bootstrap](https://getbootstrap.com/)
* [eslint](https://github.com/eslint/eslint)
* [Google Font](https://fonts.google.com/)
* [Font Awesome ](https://fontawesome.com/)
* [CKEditor4](https://ckeditor.com/ckeditor-4/)

## 參考設計稿

[The F2E - 前端修練精神時光屋](https://challenge.thef2e.com/user/3?schedule=4279#works-4279)
