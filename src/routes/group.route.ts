import * as express from 'express';
import validate from 'express-validation';
import paramValidation from '../config/param-validation';
import * as groupctl from '../controllers/group.controller';
const router = express.Router(); // eslint-disable-line new-cap


router.route('/getAllGroups')
.get((req, res, next) => {
    groupctl.getAllGroups(req,res,next);
});

router.route('/createOneGroupItem')
.post(validate(paramValidation.createGroupHouseItem), groupctl.createOneGroupItem);

router.route('/getGroupBySearch')
.post(validate(paramValidation.getGroupBySearch), groupctl.getGroupBySearch);

router.route('/getGroupItem')
.post(validate(paramValidation.getGroupItem), groupctl.getGroupItem);

router.route('/getGroupRules')
.get((req, res, next) => {
    groupctl.getGroupRules(req,res,next);
});

export default router;