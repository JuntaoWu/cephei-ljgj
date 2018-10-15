import * as express from 'express';
import validate from 'express-validation';
import paramValidation from '../config/param-validation';
import * as orderCtrl from '../controllers/order.controller';
import passport from 'passport';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/createOrder')
    .post(passport.authenticate(["jwt", "local"], { failWithError: true }), validate(paramValidation.createOrder), orderCtrl.createOrder);

router.route('/getOrderContract')
    .get(passport.authenticate("jwt", { failWithError: true }), orderCtrl.getContract);

router.route('/createOrderContract')
    .post(passport.authenticate("jwt", { failWithError: true }), validate(paramValidation.createContract), orderCtrl.createContract);

export default router;