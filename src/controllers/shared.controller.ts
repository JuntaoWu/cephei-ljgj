
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

export let getOrderContract = async (req, res, next) => {
    if (!req.params.orderId) {
        const err = new APIError("orderId not provided", httpStatus.BAD_REQUEST, true);
        return next(err);
    }
    const contractobj = await orderContractModel.findOne({ orderid: req.params.orderId });
    return res.json({
        code: 0,
        message: "OK",
        data: contractobj
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
        orderWorkList: orderworks,
        orderAmountInfo: {
            orderAmount: model.orderAmount,
            paymentStatus: model.paymentStatus,
        }
    }
    return res.json({
        code: 0,
        message: "OK",
        data: result
    });
}

export let editOrderAmount = async (req, res, next) => {

    if (!req.body.orderId) {
        const err = new APIError("orderId not provided", httpStatus.BAD_REQUEST, true);
        return next(err);
    }
    let amount =parseInt( req.body.orderAmount); 
    
    const orderupdate =await OrderModel.update({"orderid":req.body.orderId},{"orderAmount":amount});
   
  //  orderDetail.update(  {$set:{"orderAmount":amount}});//为什么不行
   if(orderupdate)
   {
        return res.json({
            code :0,
            message: "OK",
            data: {
                orderid: req.body.orderId,
                orderAmount: req.body.orderAmount
            }
        });
   }
   else
   {
    return res.json({
        error: true,
        message: "error:update false !"
    });
   }
};

//追加订单施工内容
export let appendOrderWorkToOrder = async (req, res, next) => {

    if (!req.body.orderId) {
        const err = new APIError("orderId not provided", httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    let model = await OrderModel.findOne({ orderid: req.body.orderId });
    if(!model)
    {
        return res.json({
            code: -1,
            error: true,
            message: "have no order ! ",
            data:""
        });
    }

    let orderworkid = "ORDERWORK_" + _.random(10000, 99999) + "_" + moment(new Date()).format("YYYYMMDDHHmm");//("YYYYMMDDHHmm");

    let orderworkitem = new orderWorkModel({
        orderWorkid:orderworkid,
        orderid: req.body.orderId,
        orderWork: req.body.orderWork,//不知道如何上传图片数组。
    });

    let orderworkObj = await orderworkitem.save();

   if(orderworkObj)
   {
        return res.json({
            code :0,
            message: "OK",
            data: orderworkObj
        });
   }
   else
   {
    return res.json({
        code :-1,
        error: true,
        message: "error:Add Order Work Content false !",
        data:null
    });
   }
 
};


//编辑订单施工内容，更新内容
export let editOrderWorkToOrder = async (req, res, next) => {

    if (!req.body.orderWorkid) {
        const err = new APIError("orderId not provided", httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    let model = await orderWorkModel.findOne({ orderWorkid: req.body.orderWorkid });
    if(!model)
    {
        return res.json({
            code: -1,
            error: true,
            message: "have no order work  ! ",
            data:null
        });
    }

    model.orderWork = req.body.orderWork;

    const orderWorkupdate =await model.save();
   if(orderWorkupdate)
   {
        return res.json({
            code :0,
            message: "OK",
            data: orderWorkupdate
        });
   }
   else
   {
    return res.json({
        error: true,
        code:-1,
        message: "error:Add Order Work Content false !",
        data:null
    });
   }
 
};


export let createOrderContract = async (req, res, next) => {

    if (!req.body.orderId) {
        const err = new APIError("orderId not provided", httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    let model = await OrderModel.findOne({ orderid: req.body.orderId });
    if(!model)
    {
        return res.json({
            code: -1,
            error: true,
            message: "have no order ! ",
            data:""
        });
    }

    let contractid = "ORDER_CONTRACT_" + _.random(10000, 99999) + "_" + moment(new Date()).format("YYYYMMDDHHmm");//("YYYYMMDDHHmm");

    let contractitem = new orderContractModel({
        contractid: contractid,
        orderid: req.body.orderId,
        contractUrls: req.body.contractUrls,//不知道如何上传图片数组。
    });

    let savedContract = await contractitem.save();

    return res.json({
        code: 0,
        message: "OK",
        data: {
            contractid: contractid
        }
    });
};




export default { list, load ,getOlderDetailInfo,editOrderAmount,createOrderContract,appendOrderWorkToOrder,editOrderWorkToOrder,getOrderContract};