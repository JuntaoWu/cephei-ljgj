import * as express from 'express';
import validate from 'express-validation';
import paramValidation from '../config/param-validation';
import * as orderctl from '../controllers/order.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/createOrder')
    .get((req, res, next) => {
        
    })
    .post(validate(paramValidation.createOrder),orderctl.createOrder);

router.route('/getOrderContract')
    .get((req, res, next) => {
        orderctl.getContract(req,res,next);
    });

router.route('/createOrderContract')
    .post(validate(paramValidation.createContract), orderctl.createContract);

export default router;