const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { TONClient } = require('ton-client-node-js');
const indexRouter = require('./routes/index');
const accountsRouter = require('./routes/accounts');
const cnf = require('./config.json');
const session = require('express-session');
const LokiStore = require('connect-loki')(session);
const app = express();

app.use(session({
  store: new LokiStore({}),
  secret: cnf.session.key,
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  req.ton = TONClient.create({
    servers: [
      'net.ton.dev'
    ]
  })
    .then((client) => {
      req.ton = client;
      next();
    })
})

app.use((req, res, next) => {
  if (!req.session.workchain_id && parseInt(req.session.workchain_id) != req.session.workchain_id) {
    req.session.workchain_id = 0;
    req.session.save(() => {
      console.log('save session', req.session.workchain_id);
      next();
    })
  } else
    next();
});

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'twig');

  app.use(require('./twig'));

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/', indexRouter);
  app.use('/accounts', accountsRouter);

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  module.exports = app;
