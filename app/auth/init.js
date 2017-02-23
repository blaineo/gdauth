const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const authenticationMiddleware = require('./middleware');
const pwds = require('../db').passwords;
const user = require('../db').user;

function findUser (username, callback) {
  if (username === user.username) {
    return callback(null, user)
  }
  return callback(null)
}

passport.serializeUser(function (user, cb) {
  cb(null, user.username)
})

passport.deserializeUser(function (username, cb) {
  findUser(username, cb)
})

function initPassport () {
  passport.use(new LocalStrategy(
    function(username, password, done) {
      return pwds.includes(password) ? done(null, user) : done(null, false);
    }
  ));

  passport.authenticationMiddleware = authenticationMiddleware
}

module.exports = initPassport
