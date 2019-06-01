
import orderContractModel, { OrderContract } from '../models/orderContract.model';

import ProjectItemModel from '../models/project.model';
import projectRollModel from '../models/projectRoll.model';
import subProjectModel from '../models/subProject.model';
import proCaseModel from '../models/proCase.model';
import mobileSubProDesModel from '../models/mobileSubProDes.mode';

export let getProjectItems = (req, res, next) => {
    const { limit = 50, skip = 0 } = req.query;
    ProjectItemModel.find().limit(limit).skip(skip)
        .then((items) => res.json({
            error: false,
            message: "OK",
            data: items
        }))
        .catch((e) => next(e));
}

export let createProjectItem = async (req, res, next) => {

    let projectitem = new ProjectItemModel({
        projectid: req.body.projectid,
        projectName: req.body.projectName,
        projectThumbUrl: req.body.projectThumbUrl,
        projectDescription: req.body.projectDescription
    });

    let savedContract = await projectitem.save();

    return res.json({
        error: false,
        message: "OK",
        data: {
            projectid: req.body.projectid,
            projectName: req.body.projectName,
        }
    });
}

/**
 * 获取工种后页面的滚动图片列表
 * @param req 
 * @param res 
 * @param next 
 */

export let getProItemRollItems = async (req, res, next) => {
    let itemObj;
    if (req.query.projectid) {
        itemObj = await projectRollModel.findOne({ projectid: req.query.projectid });
    }
    else {
        itemObj = await projectRollModel.findOne({ homePage: true });
    }
    if (itemObj) {
        return res.json({
            error: false,
            message: "OK",
            data: itemObj
        });
    }
    else {
        return res.json({
            error: true,
            message: "error : get project roll items error",
            data: {
                projectid: req.body.projectid
            }
        });
    }
}

/**
 * 创建滚动图标列表
 * @param req 
 * @param res 
 * @param next 
 */
export let createProItemRollItems = async (req, res, next) => {

    let rollitems = new projectRollModel({
        projectid: req.body.projectid,
        rollItemUrl: req.body.rollItemUrl
    });

    let savedrollitems = await rollitems.save();

    return res.json({
        error: false,
        message: "OK",
        data: {
            projectid: req.body.projectid
        }
    });
}

/**
 * 获取子类的工作服务项
 * @param req 
 * @param res 
 * @param next 
 */

export let getSubProjectItems = async (req, res, next) => {
    let itemObj = await subProjectModel.find({ projectid: req.query.projectid });
    if (itemObj) {
        return res.json({
            error: false,
            message: "ok",
            data: itemObj
        });
    }
    else {
        return res.json({
            error: true,
            message: "error : sub project item error",
            data: {
                projectid: req.body.projectid
            }
        });
    }
}

/**
 * 创建创建 子项目列表
 * @param req 
 * @param res 
 * @param next 
 */
export let createSubProItems = async (req, res, next) => {

    let subitems = new subProjectModel({
        projectid: req.body.projectid,
        subServiceItemList: req.body.subServiceItemList
    });

    let savedSubProjects = await subitems.save();

    return res.json({
        error: false,
        message: "OK",
        data: {
            projectid: req.body.projectid
        }
    });
}


/*
*h获取案列列表
 * @param req 
 * @param res 
 * @param next 
*/
export let getProItemCase = async(req,res,next)=>{
    const { limit = 50, skip = 0 } = req.query;
    proCaseModel.find().limit(limit).skip(skip).sort({'createdAt': 'desc'})
        .then((items) => res.json({
            error: false,
            message: "OK",
            data: items
        }))
        .catch((e) => next(e));
}

export let createProjectCase = async (req, res, next) => {

    let projectitem = new proCaseModel({
        caseid: req.body.caseid,
        hosueName: req.body.hosueName,
        projectName: req.body.projectName,
        serviceTime: req.body.serviceTime,
        caseThumbUrl:req.body.caseThumbUrl,
        orderid:req.body.orderid,
        caseLinkUrl:req.body.caseLinkUrl,
    });

    let savedContract = await projectitem.save();

    return res.json({
        error: false,
        message: "OK",
        data: {
            caseid: req.body.caseid,
            hosueName: req.body.hosueName,
            projectName: req.body.projectName
        }
    });
}



/**
 * 获取项目子页面的文字介绍说明
 * @param req 
 * @param res 
 * @param next 
 */
export let getSubProjectDes = async(req,res,next)=>{
    const { limit = 50, skip = 0 } = req.query;
    mobileSubProDesModel.find().limit(limit).skip(skip)
        .then((items) => res.json({
            error: false,
            message: "OK",
            data: items
        }))
        .catch((e) => next(e));
}


export let createProjectDes = async (req, res, next) => {

    let projectitem = new mobileSubProDesModel({
        subProjectDesid: req.body.subProjectDesid,
        subProjectDesContent: req.body.subProjectDesContent
    });

    let savedContract = await projectitem.save();

    return res.json({
        error: false,
        message: "OK",
        data: {
            subProjectDesid: req.body.subProjectDesid,
            subProjectDesContent: req.body.subProjectDesContent
        }
    });
}
