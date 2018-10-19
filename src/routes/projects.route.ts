import * as express from 'express';
import validate from 'express-validation';
import paramValidation from '../config/param-validation';
import * as projectctl from '../controllers/project.controller';
const router = express.Router(); // eslint-disable-line new-cap

router.route('/projectItems')
    .get((req, res, next) => {
        projectctl.getProjectItems(req,res,next);
    });
    
router.route('/createProjectItem')
    .post(validate(paramValidation.createProjectItem), projectctl.createProjectItem);

router.route('/getProItemRollItems')
    .get((req, res, next) => {
        projectctl.getProItemRollItems(req,res,next);
    });

router.route('/getSubProjectItems')
.get((req, res, next) => {
    projectctl.getSubProjectItems(req,res,next);
});

export default router;