const express = require('express');

const router = express.Router();

const firebaseDb = require('../connections/firebase_admin').db;
const firebaseClient = require('../connections/firebase_client');

const firebaseAuth = firebaseClient.auth();

const usersRef = firebaseDb.ref('users');

router.get('/signin', (req, res) => {
  const error = req.flash('error');
  const alertMsg = req.flash('alert-msg');
  const alertStatus = req.flash('alert-status');
  res.render('auth/signin', {
    hasError: error.length > 0,
    hasAlert: alertMsg.length > 0,
    error,
    alertMsg,
    alertStatus,
    testAccount: {
      email: process.env.TEST_ACCOUNT_EMAIL,
      password: process.env.TEST_ACCOUNT_PASSWORD,
    },
  });
});

router.post('/signin', (req, res) => {
  const { email, password } = req.body;

  firebaseAuth.signInWithEmailAndPassword(email, password)
    .then((user) => {
      const userUid = user.user.uid;

      usersRef.child(userUid).once('value').then((snapshot) => {
        req.session.uid = userUid;
        req.session.email = snapshot.val().email;
        req.session.nickname = snapshot.val().nickname;

        req.flash('alert-msg', '登入成功');
        req.flash('alert-status', 'success');
        res.redirect('/');
      });
    })
    .catch((error) => {
      const errorCode = error.code;
      let errorMsg = '';
      switch (errorCode) {
        case 'auth/user-not-found':
          errorMsg = '找不到此 Email 用戶';
          break;
        case 'auth/invalid-email':
          errorMsg = '請輸入正確 Email';
          break;
        case 'auth/wrong-password':
          errorMsg = '密碼錯誤';
          break;
        default:
          errorMsg = error.message;
          break;
      }
      req.flash('error', errorMsg);
      res.redirect('/auth/signin');
    });
});

router.get('/signup', (req, res) => {
  const error = req.flash('error');
  const alertMsg = req.flash('alert-msg');
  const alertStatus = req.flash('alert-status');
  res.render('auth/signup', {
    hasError: error.length > 0,
    hasAlert: alertMsg.length > 0,
    error,
    alertMsg,
    alertStatus,
  });
});

router.post('/signup', (req, res) => {
  const { email, password, nickname } = req.body;

  firebaseAuth.createUserWithEmailAndPassword(email, password)
    .then((user) => {
      const userUid = user.user.uid;
      const saveUser = {
        uid: userUid,
        email,
        nickname,
      };

      firebaseDb.ref(`/users/${userUid}`).set(saveUser);

      req.flash('alert-msg', '註冊成功');
      req.flash('alert-status', 'success');
      res.redirect('/auth/signin');
    }).catch((error) => {
      const errorCode = error.code;
      let errorMsg = '';
      switch (errorCode) {
        case 'auth/email-already-in-use':
          errorMsg = '此 Email 已存在';
          break;
        case 'auth/invalid-email':
          errorMsg = '請輸入正確 Email';
          break;
        case 'auth/weak-password':
          errorMsg = '密碼必須 6 個字元以上';
          break;
        default:
          errorMsg = '出錯了，請重新登入後再嘗試';
          break;
      }
      req.flash('error', errorMsg);
      res.redirect('/auth/signup');
    });
});

router.get('/signout', (req, res) => {
  firebaseAuth.signOut()
    .then(() => {
      req.session.uid = '';
      req.session.email = '';
      req.session.nickname = '';
      req.flash('alert-msg', '您已登出');
      req.flash('alert-status', 'success');
      res.redirect('/auth/signin');
    });
});

module.exports = router;
