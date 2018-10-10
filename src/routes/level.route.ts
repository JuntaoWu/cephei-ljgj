import * as express from 'express';
import validate from 'express-validation';
import expressJwt from 'express-jwt';
import paramValidation from '../config/param-validation';
import levelCtrl from '../controllers/level.controller';
import config from '../config/config';
import passport from 'passport';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
    .get(passport.authenticate("jwt"), levelCtrl.list)
    .post(passport.authenticate("jwt"), levelCtrl.create)
    .delete(passport.authenticate("jwt"), levelCtrl.remove);

export default router;
