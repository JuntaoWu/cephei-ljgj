import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import validate from 'express-validation';
import passport from 'passport';
import config from '../config/config';
import https from 'https';
import paymentCtrl from '../controllers/payment.controller';
import paramValidation from '../config/param-validation';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/createWxConfig')
    .post(passport.authenticate("jwt", { failWithError: true }),
        validate(paramValidation.createWxConfig),
        paymentCtrl.createWxConfig);

router.route('/createUnifiedOrder')
    .post(passport.authenticate("jwt", { failWithError: true }),
        validate(paramValidation.createUnifiedOrder),
        paymentCtrl.createUnifiedOrder);

router.route('/getWxSignature')
    .post(passport.authenticate("jwt", { failWithError: true }),
        validate(paramValidation.getWxSignature),
        paymentCtrl.getWxSignature);

router.route('/wxNotify')
    .post(paymentCtrl.wxNotify);


router.route('/createUnifiedOrderByFundItem')
    .post(paymentCtrl.createUnifiedOrderByFundItem);

router.route('/createUnifiedOrderByFundItemViaClient')
    .post(paymentCtrl.createUnifiedOrderByFundItem);

export default router;