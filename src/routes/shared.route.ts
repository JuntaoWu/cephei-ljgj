import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';

import sharedCtrl from '../controllers/shared.controller';
import paramValidation from '../config/param-validation';
import validate from 'express-validation';

const router = express.Router();

router.post('/',
    validate(paramValidation.getSharedOrders),
    passport.authenticate("jwtService"),
    sharedCtrl.list);

router.get('/:orderId',
    validate(paramValidation.getSharedOrderDetail),
    passport.authenticate("jwtService"),
    sharedCtrl.load);

export default router;