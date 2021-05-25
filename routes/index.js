const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
let Post = require('../models/posts');

/* GET home page. */
router.get('/', (req, res, next) =>
  Post.find()
    .sort([['time', 'descending']])
    .populate('user')
    .exec((err, results) => {
      if (err) {
        return next(err);
      }

      res.render('index', {
        title: 'Yo! Members only, papi',
        user: req.user,
        results: results,
      });
    })
);

router.get('/sign-up', userController.sign_up_get);

router.post('/sign-up', userController.sign_up_post);

router.get('/login', userController.login_get);

router.get('/create-post', userController.create_post_get);

router.post('/create-post', userController.create_post_post);

router.get('/admin', userController.admin_get);

router.post('/admin', userController.admin_post);

module.exports = router;
