import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../config/config';

import { Request, Response } from 'express';
import orderModel, { OrderItem } from '../models/order.model';
import orderContractModel, {OrderContract  } from '../models/orderContract.model';

import UserModel, { User } from '../models/user.model';
import { NextFunction } from 'express-serve-static-core';

import { ExtractJwt } from 'passport-jwt';

import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import OrderContractModel from '../models/orderContract.model';

export let createOrder = async (req, res, next) => {

    let token =  await orderModel.findOne({ token: req.body.token });
    let utoken = null;
    if(!token)
    {
        let user = await UserModel.findOne({ phoneNo: req.body.phoneNo });
        if (!user) {
            let uid = (Math.floor(Math.random() * 10));
            let avatarUrl = '/download/avatar/${uid}.jpg';//从平台 头像中获取单独的一个随机头像作为暂时用户头像，用户头像在后面点击个人中心后，上传自己的头像
            user = new UserModel({
                uid: req.body.uid? req.body.uid:"124234",
                phoneNo: req.body.phoneNo ,
                headimgurl: avatarUrl,
                sex: req.body.sex?req.body.sex:"man",
                username:req.body.username?req.body.username: req.body.phoneNo,
                nickname: req.body.username? req.body.username: req.body.phoneNo,
                password: req.body.password? req.body.password:'123456'
            });
            let savedUser = await user.save();
            
          utoken = jwt.sign({
                username: req.body.username
            }, config.jwtSecret);
        }
    }

    utoken = token;
    let orderid = "LJGJ_ORDER_"+req.body.phoneNo+"_"+ new Date(new Date().getTime()).toString();//("yyyyMMddHHMMSS");
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

export let getContract = async(req, res, next) => {

    let ordercontractObj =  await orderContractModel.find({ orderid: req.body.orderid });
    if(ordercontractObj)
    {
        return res.json(ordercontractObj);
    }
    else{
        return res.json({
            error: true,
            message: "error : getContract error",
            data: {
                username: req.body.orderid 
            }
        });
    }
}

export let createContract = async(req, res, next) => {

    let contractid = "LJGJ_ORDER_CONTRACT"+req.body.phoneNo+"_"+ new Date(new Date().getTime()).toString();//("yyyyMMddHHMMSS");

    let orderitem = new OrderContractModel({
        contractid: contractid,
        orderid:req.body.orderid,
        contractUrls:req.body.contractUrls,//不知道如何上传图片数组。
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
    
    let orderid = "LJGJ_ORDER_"+req.body.phoneNo+"_"+ new Date(new Date().getTime()).toString();//("yyyyMMddHHMMSS");
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
