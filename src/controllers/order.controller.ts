import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../config/config';

import { Request, Response } from 'express';
import orderModel, { OrderItem ,shotOrderItem} from '../models/order.model';
import orderContractModel, { OrderContract } from '../models/orderContract.model';

import UserModel, { User } from '../models/user.model';
import { NextFunction } from 'express-serve-static-core';

import { ExtractJwt } from 'passport-jwt';

import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import OrderContractModel from '../models/orderContract.model';
import OrderReivewModel, { OrderReivew } from '../models/orderReview.model';
import groupServiceModel from '../models/groupService.model';

import groupHouseItemModel, { groupServicesItem } from '../models/house.model';
import * as _ from 'lodash';

import moment from 'moment';


/** 
 * 获取团购服务列表
*/
let getGroupServiceItemName = async (gServiceItemid) => {
    let model = await groupServiceModel.find({gServiceItemid:gServiceItemid});

    let name  =model[0].gServiceItemName
    return model.map(m => {
        let result = m.gServiceItemName;
        return result;
    });
}

export let createOrder = async (req, res, next) => {

    let currentUser: User = req.user;

    let token = jwt.sign({
        username: currentUser.username
    }, config.jwtSecret);

    let orderid = "LJGJ_ORDER_" + _.random(10000, 99999) + "_" + moment(new Date()).format("YYYYMMDDHHmmss");//("YYYYMMDDHHmmss");
    let orderitem = new orderModel({
        orderid: orderid,
        phoneNo: req.body.phoneNo,
        contactsUserName: req.body.contactsUserName,
        isGroupOrder: req.body.isGroupOrder?req.body.isGroupOrder:false,
        orderContent: req.body.orderContent?req.body.orderContent:"无",
        groupContent: req.body.orderContent?req.body.orderContent:"无",
        
        orderAddress: req.body.orderAddress?req.body.orderAddress:"无",
     
        houseName: req.body.houseName?req.body.houseName:"无小区",
        orderDescription: req.body.orderDescription?req.body.orderDescription:"无",
        gServiceItemid: req.body.gServiceItemid?req.body.gServiceItemid:"无",
        orderThumbUrl:"",
        orderStatus: 1,
        orderTime:moment(new Date()).format("YYYYMMDD-HHmmss"),
        orderAmount:"审核中...",
        craftsman:"",
        createdBy: currentUser.username,
    });

    let savedItem = await orderitem.save();

    return res.json({
        code: 0,
        message: "OK",
        data: {
            token:token,  //jwt-token needed if in quick order mode.
            username: req.body.phoneNo
        }
    });
};

export let getContract = async (req, res, next) => {
    let ordercontractObj = await orderContractModel.find({ orderid:req.query.orderid });
    if (ordercontractObj) {
        return res.json(ordercontractObj);
    }
    else {
        return res.json({
            error: true,
            message: "error : getContract error",
            data: {
                orderid: req.body.orderid
            }
        });
    }
}

export let createContract = async (req, res, next) => {

    let contractid = "LJGJ_ORDER_CONTRACT" + req.body.phoneNo + "_" + moment(new Date()).format("YYYYMMDDHHmmss");//("YYYYMMDDHHmmss");

    let orderitem = new OrderContractModel({
        contractid: contractid,
        orderid: req.body.orderid,
        contractUrls: req.body.contractUrls,//不知道如何上传图片数组。
    });

    let savedContract = await orderitem.save();

    return res.json({
        error: false,
        message: "OK",
        data: {
            orderid: req.body.orderid
        }
    });
}

export let createOrderReview = async (req, res, next) => {

    let reviewid = "LJGJ_Order_Reivew" + req.body.phoneNo + "_" + moment(new Date()).format("YYYYMMDDHHmmss");//("YYYYMMDDHHmmss");

    let orderitem = new OrderReivewModel({
        reviewid: reviewid,
        orderid: req.body.orderid,
        serviceStars: req.body.serviceStars,
        workStars: req.body.workStars,
        reviewDes: req.body.reviewDes,
    });

    let savedContract = await orderitem.save();

    return res.json({
        error: false,
        message: "OK",
        data: {
            orderid: req.body.orderid
        }
    });
}

export let getMyOrders = async (req, res, next) => {

    let model = await orderModel.find();
    let shotOrders =  model.map(m => {
        let result = new shotOrderItem();
        result.orderid = m.orderid;
        result.orderContent = m.orderContent;
        result.orderStatus = m.orderStatus;
        result.orderThumbUrl = m.orderThumbUrl;
        result.orderTime = m.orderTime;
        result.orderAmount = m.orderAmount;
        result.craftsman = m.craftsman;
        return result;
    });

    if (shotOrders) {
        return res.json(shotOrders);
    }
    else {
        return res.json({
            error: true,
            message: "error : getContract error"
        });
    }
}

export default { createOrder, getContract, createContract };
