
import orderContractModel, { OrderContract } from '../models/orderContract.model';

import ProjectItemModel from '../models/project.model';
import projectRollItemModel from '../models/projectRoll.model';
import subProjectItemModel from '../models/subProject.model';


export let getProjectItems = (req, res, next) => {
    const { limit = 50, skip = 0 } = req.query;
    ProjectItemModel.find().limit(limit).skip(skip)
        .then((items) => res.json(items))
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
    let itemObj = await orderContractModel.find({ projectid: req.body.projectid });
    if (itemObj) {

        return res.json({
            error: false,
            message: "OK",
            data:itemObj
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

    let rollitems = new projectRollItemModel({
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
    let itemObj = await subProjectItemModel.find({ projectid: req.body.projectid });
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

    let subitems = new subProjectItemModel({
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
