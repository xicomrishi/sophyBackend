var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');

var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var multer = require('multer');
var flash = require('connect-flash');
const hbs = require('hbs');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.connection;


var routes = require('./routes/index');
var admins = require('./routes/admins');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// hbs.registerPartials(__dirname + '/views/partials');
// app.set('view engine', 'hbs');
var expressHbs = require('express-handlebars');
app.engine('.hbs', expressHbs({ extname: 'hbs', 
    defaultLayout: '', 
    layoutsDir: __dirname + '/views/layouts',
    helpers: {
    section: function(name, options){
        if(!this._sections) this._sections = {};
        this._sections[name] = options.fn(this);
        return null;
    },
    if_equal: function(a, b, opts) {
            if (a == b) {
                return opts.fn(this)
            } else {
                return opts.inverse(this)
            }
        },
    inc:function(value, options){
          return parseInt(value) + 1;
      },
   lower:function(str, value, options) { return str.toLowerCase(); },

    contains:function(str, value, options) { if(str.toString().indexOf(value) !== -1) return options.fn(this); else return options.inverse(this); }
   },
    partialsDir  : [
        //  path to your partials
        __dirname + '/views/partials',
    ]}));
app.set('view engine', '.hbs');
// Handle file uploads
app.use(multer({dest:'./public/images'}));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Handle Express Sessions
app.use(session({
    secret:'secret',
    saveUninitialized: true,
    resave: true
}));

// passport
app.use(passport.initialize());
app.use(passport.session());

// Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));


app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
app.enable('trust proxy');
app.use(function(req, res, next) {
    if (req.secure){
        return next();
    }
    console.log("host here " + req.host);
    if (req.host=='getsophy.net') {
       res.redirect("https://" + req.headers.host + req.url);
    }else{
      res.redirect("https://getsophy.net" + req.url);
    }
    
});

app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
});

app.use('/', routes);
app.use('/admins', admins);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//       message: err.message,
//       error: err
//     });
//   });
// }

// // production error handler
// // no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500);
//   res.render('error', {
//     message: err.message,
//     error: {}
//   });
// });

const http = require('http');
const https = require('https');

const httpServer = http.createServer(app);
const httpsServer = https.createServer(app);

httpServer.listen(80, () => {
	console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});
//app.listen(80);
module.exports = app;
