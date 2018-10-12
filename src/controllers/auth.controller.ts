import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../config/config';

import { Request, Response } from 'express';
import UserModel, { User } from '../models/user.model';
import { NextFunction } from 'express-serve-static-core';

import { ExtractJwt } from 'passport-jwt';

import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

import * as uuid from 'uuid';

async function reg(req,res,next)
{
    try {
        let user = await UserModel.findOne({ username: req.body.phoneNo });
        if (!user) {
            let uid = (Math.floor(Math.random() * 10));
            let avatarUrl = '/download/avatar/${uid}.jpg';//从平台 头像中获取单独的一个随机头像作为暂时用户头像，用户头像在后面点击个人中心后，上传自己的头像

            user = new UserModel({
                uid: req.body.uid? req.body.uid:"124234",
                phoneNo: req.body.phoneNo ,
                headimgurl: avatarUrl,
                sex: req.body.sex?req.body.sex:"man",
                nickname: req.body.nickname ? req.body.nickname: req.body.phoneNo,
                password: req.body.password? req.body.password:'123456'
            });

            let savedUser = await user.save();
            return res.json({
                error: false,
                message: "OK",
                data: savedUser
            });
        } 
        else{
            return res.json({
                error: true,
                message: "the phone no have register !"
            });
        }
    }
    catch (ex) {
        console.error(ex);
        return res.json({
            error: true,
            message: ex && ex.message || ex
        });
    }
}
/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
export let register = async (req, res, next) => {
    reg(req,res,next);
};

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */

export let login = async (req, res, next) => {

    let user = await UserModel.findOne({ phoneNo: req.body.phoneNo });
    if (!user) {
        let uid = (Math.floor(Math.random() * 10));
        let avatarUrl = '/download/avatar/${uid}.jpg';//从平台 头像中获取单独的一个随机头像作为暂时用户头像，用户头像在后面点击个人中心后，上传自己的头像

        user = new UserModel({
            uid: req.body.uid? req.body.uid:"124234",
            phoneNo: req.body.phoneNo ,
            headimgurl: avatarUrl,
            sex: req.body.sex?req.body.sex:"man",
            nickname: req.body.nickname ? req.body.nickname: req.body.phoneNo,
            username: req.body.username ? req.body.username: req.body.phoneNo,
            password: req.body.password? req.body.password:'123456'
        });

        let savedUser = await user.save();
        
        /*
        return res.json({
            error: false,
            message: "OK",
            data: savedUser
        });
        */
    }

    const token = jwt.sign({
        username: req.body.username
    }, config.jwtSecret);

    return res.json({
        error: false,
        message: "OK",
        data: {
            token,
            username: req.body.username
        }
    });

    const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
    return next(err);
};

/**
 * This is a protected route. Will return random number only if jwt token is pryovided in header.
 * @param req
 * @param res
 * @returns {*}
 */
export let getRandomNumber = (req, res) => {
    // req.user is assigned by jwt middleware if valid token is provided
    return res.json({
        user: req.user,
        num: Math.random() * 100
    });
};

export let getRandomToken = () => {
    return uuid.v4().replace(/-/g, "");
};

//export default { register, login, getRandomNumber };
