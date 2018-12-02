import express from 'express';
var router = express.Router();
import authRouter from './auth.route';
import levelRouter from './level.route';
import userRouter from './user.route';
import postRouter from './post.route';
import orderRouter from './order.route';
import projectsRouter from './projects.route';
import groupRouter from './group.route';
import wxuserRouter from './wxuser.route';
import paymentRouter from './payment.route';
import passport from 'passport';

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/auth', authRouter);

router.use('/post', postRouter);

router.use('/user', userRouter);

router.use('/order', orderRouter);

router.use('/level', levelRouter);

router.use('/projects', projectsRouter);

router.use('/group', groupRouter);

router.use('/wxuser', wxuserRouter);

router.use('/payments', paymentRouter);

export default router;
