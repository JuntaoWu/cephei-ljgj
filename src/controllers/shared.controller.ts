
import { Request, Response, NextFunction } from "express";
import { IncomingMessage } from 'http';
import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { InstanceType } from "typegoose";

import { config } from '../config/config';
import { APIError } from '../helpers/APIError';
import OrderModel, { OrderItem } from '../models/order.model';

import orderContractModel, { OrderContract } from '../models/orderContract.model';
import orderWorkModel, { orderwork } from '../models/orderwork.model';

import * as _ from 'lodash';

import moment from 'moment';

export let list = async (req, res, next) => {
    if (!req.body.payload) {
        const err = new APIError("orderIds not provided", httpStatus.BAD_REQUEST, true);
        return next(err);
    }
    const orders = await OrderModel.find({ orderid: { $in: req.body.payload } });
    return res.json({
        code: 0,
        message: "OK",
        data: orders
    });
}


export let load = async (req, res, next) => {
    if (!req.params.orderId) {
        const err = new APIError("orderId not provided", httpStatus.BAD_REQUEST, true);
        return next(err);
    }
    const orderDetail = await OrderModel.findOne({ orderid: req.params.orderId });
    return res.json({
        code: 0,
        message: "OK",
        data: orderDetail
    });
};


export let getOlderDetailInfo = async (req, res, next) => {
    
    if (!req.params.orderId) {
        const err = new APIError("orderId not provided", httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    let model = await OrderModel.findOne({ orderid: req.params.orderId });
    if (model == null) {
        return res.json({
            code: -1,
            error: true,
            message: "have no order ! "
        });
    }

    let orderWorkobj = await orderWorkModel.find({ orderid: req.params.orderId });

    let orderworks = orderWorkobj.map(m => {
        let result = {
            orderworkid: m.orderWorkid,
            orderWork: m.orderWork,
            createTime: m.createTime
        }
        return result;
    }
    );
    let orderContractobj = await orderContractModel.findOne({ orderid: req.params.orderId });
    let ordercontracturls;
    if(orderContractobj)
    {
        ordercontracturls = orderContractobj.contractUrls;
    }
    
    let result = {
        orderid: model.orderid,
        orderBaseInfo:
        {
            orderContent: model.orderContent,
            orderTime: model.orderTime,
            orderStatus: model.orderStatus,
            orderAddress: model.orderAddress,
            contactsUserName: model.contactsUserName,
            phoneNo: model.phoneNo
        },
        orderContract: ordercontracturls,
        groupOrderInfo: model.isGroupOrder ? {
            houseName: model.houseName,
            groupService: model.orderContent
        } : null,
        orderWorkList: orderworks
    }
    return res.json({
        code: 0,
        message: "OK",
        data: result
    });

}




export let createContract = async (req, res, next) => {

    let contractid = "ORDER_CONTRACT_" + _.random(10000, 99999) + "_" + moment(new Date()).format("YYYYMMDDHHmm");//("YYYYMMDDHHmm");

    let orderitem = new orderContractModel({
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
};

export default { list, load ,getOlderDetailInfo,createContract};