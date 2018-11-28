import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import validate from 'express-validation';
import passport from 'passport';
import config from '../config/config';
import https from 'https';
import wxuserCtrl from '../controllers/wxuser.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/authorize')
    .get(wxuserCtrl.authorize);

router.route('/redirect')
    .post(passport.authenticate("localWx", { failWithError: true }), wxuserCtrl.login);

export default router;