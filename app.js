var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db = require('./models/index').sequelize;
var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
//404 - catch undefined or non-existent route requests
app.use((req, res, next) => {
  const error = new Error();
  error.message = "Sorry! We couldn't find the page you were looking for.";
  res.status(404).render('page-not-found', { error });
});

// global error handler
app.use((err, req, res, next) => {
  
  if (err.status === 404) {
    res.status(404).render('page-not-found', { err });
  } 
  else {
    err.message = "Sorry! There was an unexpected error on the server.";
    // render the error page
    res.status(err.status || 500).render('error', { err });
  }

});

//IIFE for app
(async () => {

  //await db.authenticate();
  db.sync();

})();

module.exports = app;
