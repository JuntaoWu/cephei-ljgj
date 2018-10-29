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

import speakeasy from 'speakeasy';
import MySMSClient from '../config/sms-client';


/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */

export let login = async (req, res, next) => {

    let user = req.user;

    if (!user) {
        const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
        return next(err);
    }

    const token = jwt.sign({
        username: req.body.phoneNo
    }, config.jwtSecret);

    return res.json({
        code: 0,
        message: "OK",
        data: {
            token:token,
            username: req.body.phoneNo
        }
    });
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

/**
 * send verification code via SMS for TF-Validation
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
export let getVerificationCode = async (req, res, next) => {
    let user = await UserModel.findOne({ phoneNo: req.body.phoneNo });

    if (!user) {
        user = new UserModel({
            username: req.body.phoneNo,
            phoneNo: req.body.phoneNo,
            securityStamp: speakeasy.generateSecret().base32,
        });
        await user.save();
    }
    if(!user.securityStamp) {
        user.securityStamp = speakeasy.generateSecret().base32;
        await user.save();
    }

    const code = speakeasy.totp({
        secret: user.securityStamp.toString(),
        encoding: 'base32',
    });

    console.log(`Sending SMS to user: ${user.phoneNo}, code: ${code}`);

    let smsClient = new MySMSClient();
    smsClient.sendSMS({
        PhoneNumbers: req.body.phoneNo,
        SignName: '邻家工匠',
        TemplateCode: 'SMS_148080358',
        TemplateParam: `{ "code": "${code}" }`
    }).then((result) => {
        let { Code } = result;
        if (Code === 'OK') {
            console.log(result);
        }
        return res.json({
            code: 0,
            message: "OK",
        });
    }).catch((err) => {
        console.log(err);
        return res.json({
            code: 10001,
            message: "Send SMS failed"
        });
    });
};

export default { login, getVerificationCode };
