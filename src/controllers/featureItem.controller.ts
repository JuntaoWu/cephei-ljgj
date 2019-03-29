
import * as _ from 'lodash';
import moment from 'moment';
import featureItemModel, { featureItem } from '../models/featureItem.model';
import APIError from '../helpers/APIError';
import * as httpStatus from 'http-status';

/**
 * 创建一个特色项目
 * @param req 
 * @param res 
 * @param next 
 */
export let createOneFeatureItem = async (req, res, next) => {

    let featureItemid = "Feature"+ moment(new Date()).format("YYYYMMDDHHmm");//("YYYYMMDDHHmm");

    let fItem = new featureItemModel({
        featureItemid: featureItemid,
        featureItemTitle: req.body.featureItemTitle,
        featureItemDes: req.body.featureItemDes,
        featureItemThumbUrl: req.body.featureItemThumbUrl,
        featureItemLinkUrl: req.body.featureItemLinkUrl
    });

    let fundobj = await fItem.save();

    return res.json({
        code: 0,
        message: "OK",
        data: {
            featureItemid: featureItemid,
            featureItemTitle: req.body.featureItemTitle
        }
    });
}

/**
 * 获取特色项目
 * @param req 
 * 
 * @param res 
 * @param next 
 */
export let getFeatureItems = async (req, res, next) => {
    let featureitems = await featureItemModel.find();
    if (featureitems) {
        return res.json({
            code: 0,
            data: featureitems
        });
    }
    else {
        return res.json({
            error: true,
            message: "error : get group items error",
            data: {
                projectid: req.body.projectid
            }
        });
    }
}

export default { getFeatureItems, createOneFeatureItem };