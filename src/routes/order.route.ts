import * as express from 'express';
import validate from 'express-validation';
import paramValidation from '../config/param-validation';
import * as orderCtrl from '../controllers/order.controller';
import * as orderfunds from '../controllers/funditem.controller';
import passport from 'passport';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/createOrder')
    .post(passport.authenticate(["jwt", "local"], { failWithError: true }), validate(paramValidation.createOrder), orderCtrl.createOrder);

    
router.route('/createFundItem')
.post(passport.authenticate(["jwt"], { failWithError: true }), validate(paramValidation.createfund), orderfunds.createOneFundItem);


router.route('/getOrderContract')
    .get(passport.authenticate("jwt", { failWithError: true }), orderCtrl.getContract);

router.route('/createOrderContract')
    .post(passport.authenticate("jwt", { failWithError: true }), validate(paramValidation.createContract), orderCtrl.createContract);

router.route('/createOrderReview')
    .post(passport.authenticate("jwt"), validate(paramValidation.createReview), orderCtrl.createOrderReview);

router.route('/getMyOrders')
.get(passport.authenticate("jwt"), orderCtrl.getMyOrders);

router.route('/getOrderInfo')
.get(passport.authenticate("jwt"), validate(paramValidation.getOrderInfo), orderCtrl.getOrderInfo);


router.route('/getOrderFunds')
.get(passport.authenticate("jwt"), validate(paramValidation.getOrderInfo), orderfunds.getFundItems);



export default router;