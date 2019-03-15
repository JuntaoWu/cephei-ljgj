import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../config/config';

import { Request, Response } from 'express';
import orderModel, { OrderItem, shotOrderItem, OrderStatus } from '../models/order.model';
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
import orderDiscountModel from '../models/orderdiscount.model';
import orderWorkModel from '../models/orderwork.model';
import ProjectItemModel, { ProjectItem } from '../models/project.model';
import funditemModel, { FundStatus } from '../models/funditem.model';
 
import groupHouseItemModel, { groupServicesItem } from '../models/house.model';
import * as _ from 'lodash';

import moment from 'moment';
import { string } from 'joi';
import { forEach } from 'async';
import discountModel from '../models/discount.model';

/** 
 * 获取团购服务列表
*/
let getGroupServiceItemName = async (gServiceItemid) => {
    let model = await groupServiceModel.find({ gServiceItemid: gServiceItemid });

    let name = model[0].gServiceItemName
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

    let gservice;
    let groupHouseObj;
    if(req.body.isGroupOrder)
    {
            gservice = await groupServiceModel.findOne({ gServiceItemid: req.body.gServiceItemid });
            groupHouseObj = await groupHouseItemModel.findOne({groupid:req.body.groupid});
    }
    else
    {
            gservice = await ProjectItemModel.findOne({ projectid: req.body.projectid });
    }

    let orderid = "ORDER_" + _.random(1000, 9999) + "_" + moment(new Date()).format("YYYYMMDDHHmm");//("YYYYMMDDHHmm");
    let orderitem = new orderModel({
        orderid: orderid,
        phoneNo: req.body.phoneNo,
        contactsUserName: req.body.contactsUserName,
        isGroupOrder: req.body.isGroupOrder ? req.body.isGroupOrder : false,
        orderContent: req.body.isGroupOrder ? ( gservice ? gservice.gServiceItemName : "无"):(req.body.projectid ? gservice.projectName : "无"),
        orderAddress: req.body.orderAddress ? req.body.orderAddress : req.body.isGroupOrder ? groupHouseObj.houseAddress:"无" ,
        groupid: req.body.groupid ? req.body.groupid : "无",
        orderDescription: req.body.orderDescription ? req.body.orderDescription : "无",
        gServiceItemid: req.body.gServiceItemid ? req.body.gServiceItemid : "无",
        orderThumbUrl: "",
        orderStatus: OrderStatus.Initializing,
        orderTime: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),//req.body.createTime,
        orderAmount: null,  // todo: change to undefined.
        craftsman: "",
        createdBy: currentUser.username,
    });

    let savedItem = await orderitem.save();

    return res.json({
        code: 0,
        message: "OK",
        data: {
            token: token,  //jwt-token needed if in quick order mode.
            username: req.body.phoneNo
        }
    });
};

export let getContract = async (req, res, next) => {
    let ordercontractObj = await orderContractModel.findOne({ orderid: req.query.orderid });
    if (ordercontractObj) {
        return res.json({
            contractid: ordercontractObj.contractid,
            orderid: ordercontractObj.orderid,
            contractUrls: ordercontractObj.contractUrls.map(i => {
                return {
                    cmgUrl: i
                };
            })
        });
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

    let contractid = "ORDER_CONTRACT_" + _.random(10000, 99999) + "_" + moment(new Date()).format("YYYYMMDDHHmm");//("YYYYMMDDHHmm");

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

    let reviewid = "ORDER_Reivew" + req.body.phoneNo + "_" + moment(new Date()).format("YYYYMMDDHHmm");//("YYYYMMDDHHmm");

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

//获取订单列表
export let getMyOrders = async (req, res, next) => {

    let currentUser: User = req.user;

    let model = await orderModel.find({ createdBy: currentUser.phoneNo }).sort({'orderTime': 'desc'});
    let shotOrders = model.map(m => {
        let result = new shotOrderItem();
        result.orderid = m.orderid;
        result.isGroupOrder = m.isGroupOrder;
        result.orderContent = m.orderContent;
        result.phoneNo = m.phoneNo;
        result.contactsUserName = m.contactsUserName;
        result.orderStatus = m.orderStatus;
        result.orderThumbUrl = m.orderThumbUrl;
        result.orderTime = m.orderTime;
        result.orderAmount = m.orderAmount;
        result.craftsman = m.craftsman;
        result.orderAddress = m.orderAddress;
        result.paymentStatus = m.paymentStatus;
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

/*
    获取订单折扣金额，根据不同条件获取订单折扣金额
*/
let getDiscountAmount = function (discoutnid, orderamount) {
    let disamount = 0;
    switch (discoutnid) {
        case "LJGJ_DICOUNT_001":
            {
                if (Number(orderamount) > 2000) {
                    disamount = -200;
                }
            }
            break;
        case "LJGJ_DICOUNT_002":
            {
                disamount = -Number(orderamount) * 0.9;
            }
            break;
        case "LJGJ_DICOUNT_003":
            {
                disamount = -Number(orderamount) * 0.8;
            }
            break;
        case "LJGJ_DICOUNT_004":
            {
                if (Number(orderamount) > 3000) {
                    disamount = -350;
                }
            }
            break;
        case "LJGJ_DICOUNT_Group_001":
            {
                if (Number(orderamount) > 3000) {
                    disamount = -300;
                }
            }
            break;
        case "LJGJ_DICOUNT_Group_002":
            {
                disamount = -Number(orderamount) * 0.9;
            }
            break;
        case "LJGJ_DICOUNT_Group_003":
            {
                disamount = -Number(orderamount) * 0.9;
            }
            break;
        case "LJGJ_DICOUNT_Group_004":
            {
                if (Number(orderamount) > 1000) {
                    disamount = -100;
                }
            }
            break;
    }
    return disamount;
}

/*
    getOrderInfo :
    获取订单详情 
*/
export let getOrderInfo = async (req, res, next) => {
    let currentUser: User = req.user;

    let model = await orderModel.findOne({ orderid: req.query.orderid });
    if (model == null) {
        return res.json({
            code: -1,
            error: true,
            message: "have no order ! "
        });
    }

    let paidAmount=0;
    let funditems = [] ;
    if( req.query.orderid != null)
    {
        let funds = await funditemModel.find({ orderid: req.query.orderid });
        if(!funds)
        {   
            funds.map(m => {
                let result = {
                    fundItemTitle: m.fundItemTitle,
                    fundItemAmount: m.fundItemAmount,
                    fundItemStatus: m.fundItemStatus
                }
                if(m.fundItemStatus == FundStatus.Completed)
                {
                    paidAmount += Number(m.fundItemAmount);
                }
                funditems.push(result);
            });
        }
    }

    let service = await groupServiceModel.findOne({ gServiceItemid: model.gServiceItemid });

    let usrdiscounts = [];//获取符合条件的折扣条目

    /*
    let userDiscountList = currentUser.discountList;

    let usrdiscounts = [];//获取符合条件的折扣条目

    if (model.isGroupOrder) {
        let groupDiscount = await discountModel.findOne({ discountid: service.discountid });

        let disamount = getDiscountAmount(service.discountid, model.orderAmount);

        if (disamount < 0) {
            let result = {
                discountTitle: groupDiscount.discountTitle,
                discountAmount: disamount
            }
            usrdiscounts.push(result);
        }
    }
    else 
    {
        userDiscountList.forEach(
            function (m, index) {
                if (m.projectid == model.projectid) {
                    let disamount = getDiscountAmount(m.discountid, model.orderAmount);
                    if (disamount < 0) {
                        let result = {
                            discountTitle: m.discountTitle,
                            discountAmount: disamount
                        }
                        usrdiscounts.push(result);
                    }
                }
            }
        );
    }
    */

    let orderWorkobj = await orderWorkModel.find({ orderid: req.query.orderid });
    let groupobj = model.isGroupOrder ?  await groupHouseItemModel.findOne({ groupid: model.groupid}):null;
 
    let orderworks = orderWorkobj.map(m => {
        let result = {
            orderworkid: m.orderWorkid,
            orderWork: m.orderWork,
            createTime: m.createTime
        }
        return result;
    }
    );

    let result = {
        orderid: model.orderid,
        orderBaseInfo:
        {
            orderContent: model.orderContent ,
            orderTime: model.orderTime,
            orderStatus: model.orderStatus,
            orderAddress: model.orderAddress,
            contactsUserName:model.contactsUserName,
            phoneNo:model.phoneNo
        },
        groupOrderInfo: model.isGroupOrder ? {
            houseName:  groupobj?groupobj.houseName:null,
            groupService: service.gServiceItemName
        } : null,
        fundItems:funditems,
        orderAmountInfo:
        {
            orderAmount: model.orderAmount,
            paidAmount: model.paidAmount,
            paymentStatus: model.paymentStatus,
            orderDiscountList: usrdiscounts,
            surplusAmount: Number(model.orderAmount)-Number(paidAmount)
        },
        orderWorkList: orderworks
    }
    return res.json({
        code: 0,
        message: "OK",
        data: result
    });
}

export default { createOrder, getContract, createContract };
