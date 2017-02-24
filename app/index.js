const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const exphbs = require('express-handlebars');
const app = express();
const sendmail = require('sendmail')();

require('./auth').init(app)

app.use(bodyParser.urlencoded({
  extended: false
}));

app.engine('.hbs', exphbs({
  defaultLayout: 'layout',
  extname: '.hbs',
  layoutsDir: path.join(__dirname),
  partialsDir: path.join(__dirname)
}))
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname + '/views'));

app.use(require('cookie-parser')());
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

/* Routes */
app.all('/', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

app.get('/', (req, res) => {
  res.render('home', { user: req.user });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/auth', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    req.logIn(user, (err) => {
    res.setHeader('Content-Type', 'application/json');
      if (err) {
        res.send(JSON.stringify({ auth: false }));
      } else {
        res.send(JSON.stringify({ auth: true }));
      }
    });
  })(req, res, next);
});

app.get('/email', (req, res) => {
    res.render('mail');
});
app.post('/email', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.body.email) {
    let status = 'delivered';
    sendmail({
        from: 'request@godfreydadich.com',
        to: 'blaineo@gmail.com',
        subject: 'GodfreyDadich case studies access request',
        html: `Please Grant access to email address: ${req.body.email}`,
      }, function(err, reply) {
        status = 'undeliverable';
        console.log(err && err.stack);
        console.dir(reply);
    });
    res.send(JSON.stringify({ email: status }));
  } else {
    res.send(JSON.stringify({ email: 'undeliverable' }));
  }
});

app.use('/case',
  passport.authenticationMiddleware(),
  express.static('casestudies')
);

module.exports = app;
