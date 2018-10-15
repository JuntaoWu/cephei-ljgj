import * as express from 'express';
import validate from 'express-validation';
import expressJwt from 'express-jwt';
import paramValidation from '../config/param-validation';
//import authCtrl from '../controllers/auth.controller';

import * as authCtrl from '../controllers/auth.controller';
import config from '../config/config';
import passport from 'passport';

const router = express.Router(); // eslint-disable-line new-cap

/** POST /api/auth/login - Returns token if correct username and password is provided */
router.route('/login')
    .post(passport.authenticate("local"), authCtrl.login);

/** GET /api/auth/random-number - Protected route,
 * needs token returned by the above as header. Authorization: Bearer {token} */
router.route('/random-number')
    .get(expressJwt({ secret: config.jwtSecret }), authCtrl.getRandomNumber);

/** POST /api/auth/getVerificationCode - Allow anyone to send SMS code via phoneNo */
router.route('/getVerificationCode')
    .post(validate(paramValidation.getVerificationCode), authCtrl.getVerificationCode);

export default router;
