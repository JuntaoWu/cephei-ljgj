import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../config/config';

import { Request, Response, json } from 'express';
import orderModel, { OrderItem } from '../models/order.model';
import orderContractModel, { OrderContract } from '../models/orderContract.model';

import UserModel, { User } from '../models/user.model';
import { NextFunction } from 'express-serve-static-core';

import { ExtractJwt } from 'passport-jwt';

import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import OrderContractModel from '../models/project.model';
import ProjectItemModel from '../models/project.model';
import projectRollItemModel from '../models/projectRoll.model';
import subProjectItemModel from '../models/subProject.model';

import moment from 'moment';
import groupServiceModel from '../models/groupService.model';

import groupHouseItemModel, { groupServicesItem } from '../models/house.model';
import groupRuleModel from '../models/groupRule.model';

/**
 * 
 * @param req 获取所有团购小区列表
 * @param res 
 * @param next 
 */
export let getAllGroups = async (req, res, next) => {

    const { limit = 250, skip = 0 } = req.query;

    let itemObj = await groupHouseItemModel.find().limit(limit).skip(skip).sort({'createdAt': 'desc'});
    if (itemObj) {
        return res.json(itemObj);
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

/** 
 * 获取团购服务列表
*/
export let getGroupServiceItems = async () => {
    let model = await groupServiceModel.find();
    return model.map(m => {
        let result = new groupServicesItem();
        result.gServiceItemid = m.gServiceItemid;
        result.gServiceItemName = m.gServiceItemName;
        return result;
    });
}


/**
 * 创建一个团购小区项
 * @param req 
 * @param res 
 * @param next 
 */
export let createOneGroupItem = async (req, res, next) => {

    let groupid = "LJGJ_GROUP_ID_" + "_" + moment(new Date()).format("YYYYMMDDHHmm");//("YYYYMMDDHHmm");

    let houseid = "LJGJ_House_ID_" + "_" + moment(new Date()).format("YYYYMMDDHHmm");//("YYYYMMDDHHmm");

    let groupServiceList = await getGroupServiceItems();

    let subitems = new groupHouseItemModel({
        groupid: groupid,
        houseid: houseid,
        houseName: req.body.houseName,
        houseAddress: req.body.houseAddress,
        houseThumbUrl: req.body.houseThumbUrl?req.body.houseThumbUrl:"/image/houses/house00.jpg",
        userJoinCount: 0,
        groupServiceList: groupServiceList
    });

    let savedSubProjects = await subitems.save();

    return res.json({
        error: false,
        message: "OK",
        data: {
            houseid: req.body.houseid,
            houseName:req.body.houseName
        }
    });
}

/**
 *  搜索 目标团购小区
 * @param req 
 * 
 * @param res 
 * @param next 
 */
export let getGroupBySearch = async (req, res, next) => {

    var query ={};
    
    /*
    if(req.body.houseName)
    {
        query["houseName"] = new RegExp(req.body.houseName);
    }
*/
    let itemObj = await groupHouseItemModel.find({
        houseName : {$regex:req.body.houseName}
    });

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
            message: "error : search Group error",
            data: {
                houseName: req.body.houseName
            }
        });
    }
}

/**
 * 根据group id 返回给指定团购小区页面。
 * @param req 
 * 
 * @param res 
 * @param next 
 */
export let getGroupItem = async (req, res, next) => {
    
    let groupitemObj = await groupHouseItemModel.find({ groupid: req.body.groupid });

    if(groupitemObj)
    {
        return res.json({
            error: false,
            message: "ok",
            data: groupitemObj
        });

    }
    else {
        return res.json({
            error: true,
            message: "error : get gruop item error",
            data: {
                houseName: req.body.houseName
            }
        });
    }
}

/**
 * 根据group id 返回给指定团购小区页面。
 * @param req 
 * 
 * @param res 
 * @param next 
 */
export let getGroupRules = async (req, res, next) => {
    
    const { limit = 250, skip = 0 } = req.query;

    let grouprules = await groupRuleModel.find().limit(limit).skip(skip);
    if (grouprules) {
        return res.json({
            error: false,
            message: "ok",
            data: grouprules
        });
    }
    else {
        return res.json({
            error: true,
            message: "error : get group rules error",
         
        });
    }
}
