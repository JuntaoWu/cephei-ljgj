import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import validate from 'express-validation';
import passport from 'passport';
import config from '../config/config';
import https from 'https';
import paymentCtrl from '../controllers/payment.controller';
import paramValidation from '../config/param-validation';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/createUnifiedOrder')
    .post(passport.authenticate("jwt", { failWithError: true }),
        validate(paramValidation.createUnifiedOrder),
        paymentCtrl.createUnifiedOrder);

export default router;