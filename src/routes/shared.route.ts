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
    sharedCtrl.getOlderDetailInfo);

router.route('/order/editOrderAmount')
    .post(validate(paramValidation.editOrderAmount), sharedCtrl.editOrderAmount);

router.route('/order/createOrderContract')
    .post(validate(paramValidation.createContract), sharedCtrl.createOrderContract);

router.route('/order/appendOrderWorkToOrder')
.post(validate(paramValidation.appendOrderWorkToOrder), sharedCtrl.appendOrderWorkToOrder);

router.route('/order/editOrderWorkToOrder')
.post(validate(paramValidation.editOrderWorkToOrder), sharedCtrl.editOrderWorkToOrder);




export default router;