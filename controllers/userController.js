const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { DateTime } = require('luxon');
const Post = require('../models/posts');
const async = require('async');
require('dotenv').config();

exports.sign_up_get = (req, res, next) => {
  res.render('sign-up', { title: 'Sign Up', err_msg: ' ' });
};

exports.sign_up_post = [
  body('email', "That's not a valid email").isEmail(),
  body('username').trim().isLength({ min: 3 }).escape(),
  body('password', 'not a valid password')
    .isLength({ min: 4 })
    .matches(/[0-9]/)
    .withMessage('Password only contains numbers')
    .exists(),
  body('confirmPassword', "Passwords don't match")
    .exists()
    .custom((value, { req }) => value === req.body.password),

  (req, res, next) => {
    const errors = validationResult(req);

    bcrypt.hash(req.body.password, 10, (err, hashed) => {
      let user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        username: req.body.username,
        password: hashed,
        admin: false,
      });
      if (!errors.isEmpty()) {
        res.render('sign-up', {
          title: 'sign up',
          err_msg: 'Passwords do not match. Please try again',
          errors: errors.array(),
        });
        return;
      } else {
        user.save((err) => {
          if (err) {
            return next(err);
          }
          res.redirect(`/login`);
        });
      }
    });
  },
];

exports.login_get = (req, res, next) => {
  res.render('login', { user: req.user });
};

exports.create_post_get = (req, res, next) => {
  res.render('create_post', { title: 'create post', user: req.user });
};

exports.create_post_post = (req, res, next) => {
  const date = DateTime.now().toLocaleString(
    DateTime.DATETIME_MED_WITH_SECONDS
  );
  let post = new Post({
    title: req.body.title,
    message: req.body.message,
    user: res.locals.currentUser._id,
    time: date,
  });

  post.save((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

exports.admin_get = (req, res, next) => {
  res.render('admin', { title: 'Get it right and become an admin' });
};

exports.admin_post = [
  body('admin').trim().equals(process.env.power).escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.redirect('/');
    } else {
      async.parallel(
        {
          user: (callback) => {
            User.findById(req.params.id).exec(callback);
          },
        },
        (err, results) => {
          console.log(results.user);
          if (err) {
            return next(err);
          }
          const userPlus = new User({
            _id: results.user._id,
            first_name: results.user.first_name,
            last_name: results.user.last_name,
            email: results.user.email,
            username: results.user.username,
            password: results.user.password,
            admin: true,
          });
          console.log(userPlus);
          User.findByIdAndUpdate(
            results.user._id,
            userPlus,
            {},
            (err, theuser) => {
              if (err) {
                return next(err);
              }
              res.redirect('/');
            }
          );
        }
      );
    }
  },
];
