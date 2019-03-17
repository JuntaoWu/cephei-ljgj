import * as express from 'express';
import validate from 'express-validation';
import paramValidation from '../config/param-validation';
import * as featureCtl from '../controllers/featureItem.controller';
const router = express.Router(); // eslint-disable-line new-cap

router.route('/getFeatureItems')
.get((req, res, next) => {
    featureCtl.getFeatureItems(req,res,next);
});

router.route('/createOneFeatureItem')
.post(validate(paramValidation.createFeatureItem), featureCtl.createOneFeatureItem);

export default router;