const express = require('express');

const router = express.Router();

const multer = require('multer');
const moment = require('moment');
const striptags = require('striptags');
const { body, validationResult } = require('express-validator');

const firebaseDb = require('../connections/firebase_admin').db;
const firebaseClient = require('../connections/firebase_client');

const { uploadFile, delFile } = require('../modules/firebaseStorage');
const convertPagination = require('../modules/convertPagination');

const firebaseAuth = firebaseClient.auth();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024, // 3mb
  },
}).single('coverimg');

// 首頁
router.get('/', (req, res) => {
  const star = req.query.star || 'all';
  const arrange = req.query.arrange || 'card';
  const currentPage = Number(req.query.page) || 1;

  const alertMsg = req.flash('alert-msg');
  const alertStatus = req.flash('alert-status');
  const userUid = req.session.uid;

  let categories = {};
  let articles = [];
  let path = '';

  firebaseDb.ref(`/categories/${userUid}`).once('value')
    .then((snapshot) => {
      categories = snapshot.val() || {};
      return firebaseDb.ref(`/articles/${userUid}`).orderByChild('create_time').once('value');
    })
    .then((snapshot) => {
      path = `/?arrange=${arrange}`;

      snapshot.forEach((snapshotChild) => {
        articles.push(snapshotChild.val());
      });

      if (star === 'star') {
        path = `/?arrange=${arrange}&star=star`;
        articles = articles.filter((item) => item.star === true);
      }

      articles.reverse();

      const data = convertPagination(articles, currentPage, path);

      res.render('index', {
        hasAlert: alertMsg.length > 0,
        alertMsg,
        alertStatus,
        moment,
        striptags,
        categories,
        articles: data.data,
        page: data.page,
        star,
        arrange,
      });
    });
});

// 分類筆記本
router.get('/category/:categoryId', (req, res) => {
  const star = req.query.star || 'all';
  const arrange = req.query.arrange || 'card';
  const currentPage = Number(req.query.page) || 1;

  const alertMsg = req.flash('alert-msg');
  const alertStatus = req.flash('alert-status');
  const userUid = req.session.uid;
  const { categoryId } = req.params;

  let categories = {};
  let articles = [];
  let path = '';

  firebaseDb.ref(`/categories/${userUid}`).once('value')
    .then((snapshot) => {
      categories = snapshot.val() || {};
      return firebaseDb.ref(`/articles/${userUid}`).orderByChild('author').equalTo(userUid).once('value');
    })
    .then((snapshot) => {
      path = `/category/${categoryId}?arrange=${arrange}`;

      snapshot.forEach((snapshotChild) => {
        const val = snapshotChild.val();
        if (val.category === categoryId) {
          articles.push(val);
        }
      });

      if (star === 'star') {
        path = `/category/${categoryId}?arrange=${arrange}&star=star`;
        articles = articles.filter((item) => item.star === true);
      }

      articles.reverse();

      const data = convertPagination(articles, currentPage, path);

      res.render('index', {
        hasAlert: alertMsg.length > 0,
        alertMsg,
        alertStatus,
        moment,
        striptags,
        categories,
        articles: data.data,
        page: data.page,
        categoryId,
        star,
        arrange,
      });
    });
});

// 筆記頁
router.get('/post/:articleId', (req, res) => {
  const alertMsg = req.flash('alert-msg');
  const alertStatus = req.flash('alert-status');
  const userUid = req.session.uid;
  const { articleId } = req.params;

  let categories = '';

  firebaseDb.ref(`/categories/${userUid}`).once('value')
    .then((snapshot) => {
      categories = snapshot.val() || {};
      return firebaseDb.ref(`/articles/${userUid}`).child(articleId).once('value');
    })
    .then((snapshot) => {
      const article = snapshot.val();

      if (!article) {
        return res.render('error', {
          title: '找不到該文章',
        });
      }

      return res.render('post', {
        hasAlert: alertMsg.length > 0,
        alertMsg,
        alertStatus,
        moment,
        categories,
        article,
      });
    });
});

// 新增筆記頁面
router.get('/article/create', (req, res) => {
  const alertMsg = req.flash('alert-msg');
  const alertStatus = req.flash('alert-status');
  const userUid = req.session.uid;

  firebaseDb.ref(`/categories/${userUid}`).once('value')
    .then((snapshot) => {
      const categories = snapshot.val() || {};

      res.render('edit-article', {
        hasAlert: alertMsg.length > 0,
        alertMsg,
        alertStatus,
        categories,
      });
    });
});

// 修改筆記頁面
router.get('/article/update/:articleId', (req, res) => {
  const alertMsg = req.flash('alert-msg');
  const alertStatus = req.flash('alert-status');
  const userUid = req.session.uid;
  const { articleId } = req.params;

  let categories = {};
  let article = {};

  firebaseDb.ref(`/categories/${userUid}`).once('value')
    .then((snapshot) => {
      categories = snapshot.val() || {};
      return firebaseDb.ref(`/articles/${userUid}`).child(articleId).once('value');
    })
    .then((snapshot) => {
      article = snapshot.val() || {};

      res.render('edit-article', {
        hasAlert: alertMsg.length > 0,
        alertMsg,
        alertStatus,
        categories,
        article,
      });
    });
});

// 新增筆記
router.post('/article/create', upload, (req, res) => {
  // 解決 obj.hasOwnProperty is not a function 錯誤
  const data = JSON.parse(JSON.stringify(req.body));
  const userUid = req.session.uid;
  const timestamp = Math.floor(Date.now() / 1000);
  const articleRef = firebaseDb.ref(`/articles/${userUid}`).push();
  data.id = articleRef.key;
  data.update_time = timestamp;
  data.create_time = timestamp;
  data.author = userUid;
  data.star = false;

  // 如果有上傳新封面圖片
  if (req.file) {
    uploadFile(req.file)
      .then((value) => {
        data.coverImg_name = value.fileName;
        data.coverImg_url = value.fileUrl;
        return articleRef.set(data);
      })
      .then(() => {
        req.flash('alert-msg', '新增筆記成功');
        req.flash('alert-status', 'success');
        res.send({ success: true });
      })
      .catch(() => {
        req.flash('alert-msg', '出現錯誤請重新上傳');
        req.flash('alert-status', 'danger');
        res.send({ success: false });
      });
  // 沒有上傳新封面圖片
  } else {
    articleRef.set(data)
      .then(() => {
        req.flash('alert-msg', '新增筆記成功');
        req.flash('alert-status', 'success');
        res.send({ success: true });
      });
  }
});

// 更新筆記
router.post('/article/update/:articleId', upload, (req, res) => {
  const { articleId } = req.params;
  const userUid = req.session.uid;

  // 解決 obj.hasOwnProperty is not a function 錯誤
  const data = JSON.parse(JSON.stringify(req.body));
  const timestamp = Math.floor(Date.now() / 1000);
  const articleRef = firebaseDb.ref(`/articles/${userUid}`).child(articleId);
  data.update_time = timestamp;

  firebaseDb.ref(`/articles/${userUid}`).child(articleId).once('value')
    .then((snapshot) => {
      const originalImgName = snapshot.val().coverImg_name;

      // 如果有上傳新封面圖片
      if (req.file) {
        delete data.coverInfo;

        uploadFile(req.file, originalImgName)
          .then((value) => {
            data.coverImg_name = value.fileName;
            data.coverImg_url = value.fileUrl;
            return articleRef.update(data);
          })
          .then(() => {
            req.flash('alert-msg', '新增筆記成功');
            req.flash('alert-status', 'success');
            res.send({ success: true });
          })
          .catch(() => {
            req.flash('alert-msg', '出現錯誤請重新上傳');
            req.flash('alert-status', 'danger');
            res.send({ success: false });
          });
      // 沒有上傳新封面圖片
      } else {
        // 如果使用預設圖片，則刪除原封面圖片
        if (data.coverInfo === 'default') {
          delFile(originalImgName);
          data.coverImg_name = '';
          data.coverImg_url = '';
        }

        delete data.coverInfo;

        articleRef.update(data)
          .then(() => {
            req.flash('alert-msg', '更新筆記成功');
            req.flash('alert-status', 'success');
            res.send({ success: true });
          });
      }
    });
});

// 刪除筆記
router.delete('/article/delete/:articleId', (req, res) => {
  const { articleId } = req.params;
  const userUid = req.session.uid;
  const articleRef = firebaseDb.ref(`/articles/${userUid}`).child(articleId);
  articleRef.once('value').then((snapshot) => {
    // 如果有封面圖片，則刪除
    const originalImgName = snapshot.val().coverImg_name;
    if (originalImgName) {
      delFile(originalImgName);
    }
    articleRef.remove();

    req.flash('alert-msg', '已刪除筆記成功');
    req.flash('alert-status', 'success');
    res.end();
  });
});

// 收藏/取消收藏 筆記
router.put('/star/update/:articleId', (req, res) => {
  const { articleId } = req.params;
  const userUid = req.session.uid;

  const articleRef = firebaseDb.ref(`/articles/${userUid}`).child(articleId);
  let star = false;

  articleRef.once('value')
    .then((snapshot) => {
      star = !snapshot.val().star;
      articleRef.update({ star });

      switch (star) {
        case true:
          req.flash('alert-msg', '已收藏筆記');
          req.flash('alert-status', 'primary');
          break;
        default:
          req.flash('alert-msg', '已取消收藏');
          req.flash('alert-status', 'success');
          break;
      }

      res.end();
    });
});

/* 筆記本頁面 */

// 管理筆記本頁
router.get('/editcategories', (req, res) => {
  const userUid = req.session.uid;
  const error = req.flash('error');
  const alertMsg = req.flash('alert-msg');
  const alertStatus = req.flash('alert-status');

  firebaseDb.ref(`/categories/${userUid}`).once('value')
    .then((snapshot) => {
      const categories = snapshot.val() || {};

      res.render('edit-categories', {
        hasError: error.length > 0,
        hasAlert: alertMsg.length > 0,
        error,
        alertMsg,
        alertStatus,
        categories,
        pathName: 'editcategories',
      });
    });
});

// 新增筆記本
router.post('/editcategories/create', [
  body('name').isLength({ max: 7 }).withMessage('筆記本名稱 不得超過 7 個字'),
  body('path').isLength({ max: 12 }).withMessage('筆記本路徑 不得超過 12 個字元'),
  body('path').isAlphanumeric().withMessage('筆記本路徑 必須是英文或數字的組成'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const result = errors.array();
    req.flash('error', result[0].msg);
    return res.redirect('/editcategories');
  }

  const userUid = req.session.uid;
  const data = req.body;
  const categoryRef = firebaseDb.ref(`/categories/${userUid}`).push();
  const { key } = categoryRef;
  data.id = key;

  return firebaseDb.ref(`/categories/${userUid}`).orderByChild('path').equalTo(data.path).once('value')
    .then((snapshot) => {
      if (snapshot.val() !== null) {
        req.flash('error', '錯誤：已有相同路徑');
        res.redirect('/editcategories');
      } else {
        categoryRef.set(data).then(() => {
          req.flash('alert-msg', '已儲存分類成功');
          req.flash('alert-status', 'success');
          res.redirect('/editcategories');
        });
      }
    });
});

// 刪除分類
router.delete('/editcategories/delete/:categoryId', (req, res) => {
  const userUid = req.session.uid;
  const { categoryId } = req.params;
  firebaseDb.ref(`/categories/${userUid}`).child(categoryId).remove()
    .then(() => {
      req.flash('alert-msg', '已刪除分類成功');
      req.flash('alert-status', 'success');
      res.end();
    });
});

/* 設定頁面 */

// 會員設定頁
router.get('/setting', (req, res) => {
  const error = req.flash('error');
  const alertMsg = req.flash('alert-msg');
  const alertStatus = req.flash('alert-status');
  const userUid = req.session.uid;
  const userEmail = req.session.email;

  firebaseDb.ref(`/categories/${userUid}`).once('value')
    .then((snapshot) => {
      res.render('edit-user', {
        hasError: error.length > 0,
        hasAlert: alertMsg.length > 0,
        error,
        alertMsg,
        alertStatus,
        categories: snapshot.val(),
        userEmail,
        pathName: 'setting',
      });
    });
});

// 會員資料更新
router.post('/user/update/:updateItem', (req, res) => {
  const { updateItem } = req.params;
  const userUid = req.session.uid;
  const { data } = req.body;

  // 更新會員密碼
  if (updateItem === 'password') {
    const user = firebaseAuth.currentUser;

    user.updatePassword(data)
      .then(() => {
        req.flash('alert-msg', '已更新密碼成功，下次登入請使用新密碼');
        req.flash('alert-status', 'success');
        res.end();
      })
      .catch((error) => {
        const errorCode = error.code;
        let errorMsg = '';
        switch (errorCode) {
          case 'auth/weak-password':
            errorMsg = '密碼必須 6 個字元以上';
            break;
          default:
            errorMsg = error.message;
            errorMsg = '錯誤：更新密碼失敗，請重新登入再嘗試更新';
            break;
        }
        req.flash('error', errorMsg);
        res.end();
      });

  // 更新會員暱稱
  } else {
    firebaseDb.ref(`/users/${userUid}`).update({ nickname: data })
      .then(() => {
        req.session.nickname = data;
        req.flash('alert-msg', '已更新暱稱成功');
        req.flash('alert-status', 'success');
        res.end();
      })
      .catch(() => {
        req.flash('alert-msg', '錯誤：更新暱稱失敗');
        req.flash('alert-status', 'danger');
        res.end();
      });
  }
});

// 刪除用戶
router.delete('/user/delete', (req, res) => {
  const userUid = req.session.uid;
  const user = firebaseAuth.currentUser;
  user.delete()
    // 刪除用戶資料
    .then(() => firebaseDb.ref('/users').child(userUid).remove())
    // 刪除用戶分類
    .then(() => firebaseDb.ref('/categories').child(userUid).remove())
    // 刪除用戶文章
    .then(() => firebaseDb.ref('/articles').child(userUid).once('value'))
    .then((snapshot) => {
      snapshot.forEach((shopshotChild) => {
        const val = shopshotChild.val();
        // 刪除文章封面圖
        if (val.coverImg_name) {
          delFile(val.coverImg_name);
        }
        firebaseDb.ref('/articles').child(userUid).remove();
      });
    })
    // 清除 cookie
    .then(() => {
      req.session.uid = '';
      req.session.email = '';
      req.session.nickname = '';
      req.flash('alert-msg', '已成功刪除帳戶');
      req.flash('alert-status', 'success');
      res.end();
    })
    .catch(() => {
      req.flash('alert-msg', '錯誤：刪除帳戶失敗');
      req.flash('alert-status', 'danger');
      res.end();
    });
});

module.exports = router;
