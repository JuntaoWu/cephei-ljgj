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
import LevelModel, { Level } from '../models/level.model';

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
export let list = async (req, res, next) => {
    try {
        let user = req.user;
        if (!user) {
            return res.json({
                error: true,
                message: "Please login to use level maker",
            });
        }
        let levels = await LevelModel.find({
            createdBy: user.username
        });
        return res.json({
            error: false,
            message: "OK",
            data: levels
        });
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
export let json = async (req, res, next) => {
    try {
        let user = req.user;
        if (!user) {
            return res.json([]);
        }
        let levels = await LevelModel.find({
            createdBy: user.username
        });
        return res.json(levels);
    }
    catch (ex) {
        console.error(ex);
        return res.json([]);
    }
};

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
export let create = async (req, res, next) => {
    try {
        if (req.query.id) {
            let level = await LevelModel.findById(req.query.id);
            level.balls = req.body.balls;
            level.holes = req.body.holes;
            level.walls = req.body.walls;
            let savedLevel = await level.save();
            return res.json({
                error: false,
                message: "OK",
                data: savedLevel
            });
        }
        else {
            let user = req.user;
            if (!user) {
                return res.json({
                    error: true,
                    message: "Please login to save level",
                });
            }
            let level = new LevelModel(req.body);
            level.createdBy = user.username;
            let savedLevel = await level.save();
            return res.json({
                error: false,
                message: "OK",
                data: savedLevel
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
export let remove = async (req, res, next) => {
    try {
        if (req.query.id) {
            let level = await LevelModel.findByIdAndRemove(req.query.id);
            return res.json({
                error: false,
                message: "OK",
                data: level
            });
        }
        else {
            return res.json({
                error: true,
                message: "No id provided",
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

export default { list, create, remove, json };
