import * as express from 'express';
import validate from 'express-validation';
import paramValidation from '../config/param-validation';
import * as orderctl from '../controllers/order.controller';
import passport from 'passport';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/createOrder')
    .post(passport.authenticate("jwt"), validate(paramValidation.createOrder), orderctl.createOrder);

export default router;