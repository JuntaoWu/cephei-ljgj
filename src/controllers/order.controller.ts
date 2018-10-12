import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../config/config';

import { Request, Response } from 'express';
import orderModel, { OrderItem } from '../models/order.model';
import UserModel, { User } from '../models/user.model';
import { NextFunction } from 'express-serve-static-core';

import { ExtractJwt } from 'passport-jwt';

import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

import * as _ from 'lodash';

import moment from 'moment';

export let createOrder = async (req, res, next) => {

    let token =  await orderModel.findOne({ token: req.body.token });
    let utoken = null;
    if(!req.user)
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

    //todo: allow anonymous
    let currentUser: User = req.user;

    //await orderModel.find({createdBy: currentUser.username});

    let orderid = "LJGJ_ORDER_"+_.random(10000, 99999)+"_"+ moment(new Date()).format("yyyyMMddHHmmss");//("yyyyMMddHHMMSS");
    let orderitem = new orderModel({
        orderid: orderid,
        phoneNo:req.body.phoneNo,
        isGroupOrder: req.body.isGroupOrder,
        orderContent: req.body.orderContent,
        groupContent:req.body.groupContent,
        orderAddress:req.body.orderAddress,
        houseName:req.body.houseName,
        orderDescription:req.body.houseName,
        createdBy: currentUser.username,
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
