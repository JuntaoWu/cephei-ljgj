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

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
export let register = async (req, res, next) => {
    try {
        let user = await UserModel.findOne({ username: req.body.username });
        if (!user) {
            user = new UserModel({
                username: req.body.username,
                password: req.body.password
            });
            let savedUser = await user.save();

            return res.json({
                error: false,
                message: "OK",
                data: savedUser
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
};

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
export let login = (req, res, next) => {
    //console.log(user);
    // Ideally you'll fetch this from the db
    // Idea here was to show how jwt works with simplicity
    if (req.body.username === req.user.username && req.body.password === req.user.password) {
        const token = jwt.sign({
            username: req.user.username
        }, config.jwtSecret);
        return res.json({
            error: false,
            message: "OK",
            data: {
                token,
                username: req.user.username
            }
        });
    }

    const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
    return next(err);
};

/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
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

export default { register, login, getRandomNumber };
