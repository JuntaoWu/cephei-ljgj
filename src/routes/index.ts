import express from 'express';
var router = express.Router();
import authRouter from './auth.route';
import levelRouter from './level.route';
import userRouter from './user.route';
import postRouter from './post.route';
import passport from 'passport';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/auth', authRouter);

router.use('/post', postRouter);

router.use('/user', userRouter);

router.use('/level', levelRouter);

export default router;
