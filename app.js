const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const flash = require('connect-flash');
const sassMiddleware = require('node-sass-middleware');
const firebaseClient = require('./connections/firebase_client');

const firebaseAuth = firebaseClient.auth();

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

const app = express();

// view engine setup
app.engine('ejs', require('express-ejs-extend'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 3 * 60 * 60 * 1000, // 3小時
  },
}));
app.use(flash());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public/stylesheets/scss'),
  dest: path.join(__dirname, 'public/stylesheets/css'),
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true,
  prefix: '/stylesheets/css', // 刪除前綴資料夾 /stylesheets/css
  outputStyle: 'compressed', // css 壓縮
  // debug: true, // 除錯
}));

app.use(express.static(path.join(__dirname, 'public')));
// 導向 jquery
app.use('/js', express.static(`${__dirname}/node_modules/jquery/dist`));
// 導向 popper.js
app.use('/js', express.static(`${__dirname}/node_modules/popper.js/dist`));
// 導向 bootstrap
app.use('/js', express.static(`${__dirname}/node_modules/bootstrap/dist/js`));

// 確認登入狀態
const authCheck = (req, res, next) => {
  const user = firebaseAuth.currentUser;
  if (user && req.session.uid) {
    // 全域變數 - UserNickname
    res.locals.UserNickname = req.session.nickname || '';
    next();
  } else {
    res.redirect('/auth/signin');
  }
};

app.use('/auth', authRouter);
app.use('/', authCheck, indexRouter);

// catch 404 and forward to error handler
app.use((req, res) => {
  res.render('error', {
    title: '404 找不到網頁',
  });
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
