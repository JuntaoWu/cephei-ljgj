import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';

import sharedCtrl from '../controllers/shared.controller';
import paramValidation from '../config/param-validation';
import validate from 'express-validation';

const router = express.Router();

router.post('/order',
    validate(paramValidation.getSharedOrders),
    passport.authenticate("jwtService"),
    sharedCtrl.list);

router.get('/order/:orderId',
    validate(paramValidation.getSharedOrderDetail),
    passport.authenticate("jwtService"),
    sharedCtrl.load);


router.route('/order/createContract/:orderId')
    .post(passport.authenticate("jwt", { failWithError: true }), validate(paramValidation.createContract), sharedCtrl.createContract);

export default router;