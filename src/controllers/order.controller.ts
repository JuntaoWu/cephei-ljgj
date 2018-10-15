import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../config/config';

import { Request, Response } from 'express';
import orderModel, { OrderItem } from '../models/order.model';
import orderContractModel, { OrderContract } from '../models/orderContract.model';

import UserModel, { User } from '../models/user.model';
import { NextFunction } from 'express-serve-static-core';

import { ExtractJwt } from 'passport-jwt';

import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import OrderContractModel from '../models/orderContract.model';

import * as _ from 'lodash';

import moment from 'moment';

export let createOrder = async (req, res, next) => {

    let currentUser: User = req.user;

    let token = jwt.sign({
        username: currentUser.username
    }, config.jwtSecret);

    //await orderModel.find({createdBy: currentUser.username});

    let orderid = "LJGJ_ORDER_" + _.random(10000, 99999) + "_" + moment(new Date()).format("YYYYMMDDHHmmss");//("YYYYMMDDHHmmss");
    let orderitem = new orderModel({
        orderid: orderid,
        phoneNo: req.body.phoneNo,
        isGroupOrder: req.body.isGroupOrder,
        orderContent: req.body.orderContent,
        groupContent: req.body.groupContent,
        orderAddress: req.body.orderAddress,
        houseName: req.body.houseName,
        orderDescription: req.body.houseName,
        createdBy: currentUser.username,
    });

    let savedItem = await orderitem.save();

    return res.json({
        code: 0,
        message: "OK",
        data: {
            token,  //jwt-token needed if in quick order mode.
            username: req.body.username
        }
    });
};

export let getContract = async (req, res, next) => {

    let ordercontractObj = await orderContractModel.find({ orderid: req.body.orderid });
    if (ordercontractObj) {
        return res.json(ordercontractObj);
    }
    else {
        return res.json({
            error: true,
            message: "error : getContract error",
            data: {
                username: req.body.orderid
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



/*
export let getContract = async (req, res, next) => {

    let ordercontractObj =  await orderContractModel.findOne({ orderid: req.body.orderid });
    if(ordercontractObj)
    {
        
    }
    let utoken = null;
    
    let orderid = "LJGJ_ORDER_"+req.body.phoneNo+"_"+ moment(new Date()).format("YYYYMMDDHHmmss");
    let orderitem = new orderModel({
        orderid: orderid,
        token:utoken,
        phoneNo:req.body.phoneNo,
        isGroupOrder: req.body.isGroupOrder,
        orderContent: req.body.orderContent,
        groupContent:req.body.groupContent,
        orderAddress:req.body.orderAddress,
        houseName:req.body.houseName,
        orderDescription:req.body.houseName
    });
    
    let savedUser = await orderitem.save();

    return res.json({
        error: false,
        message: "OK",
        data: {
            utoken,
            username: req.body.username
        }
    });
};
*/

export default { createOrder, getContract, createContract };
