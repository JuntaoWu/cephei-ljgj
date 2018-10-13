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
import OrderContractModel from '../models/project.model';
import ProjectItemModel from '../models/project.model';


export let getProjectItems = (req, res, next) => {
    const { limit = 50, skip = 0 } = req.query;
    ProjectItemModel.find().limit(limit).skip(skip)
        .then((items) => res.json(items))
        .catch((e) => next(e));
}

/*
@prop()
public projectid: String;

@prop()
public projectName: String;

@prop()
public projectThumbUrl: String;

@prop()
public projectDescription: String;

*/

export let createProjectItem = async(req, res, next) => {

    let projectitem = new ProjectItemModel({
        projectid: req.body.projectid,
        projectName:req.body.projectName,
        projectThumbUrl:req.body.projectThumbUrl,
        projectDescription:req.body.projectDescription
    });

    let savedContract = await projectitem.save();

    return res.json({
        error: false,
        message: "OK",
        data: {
            projectid: req.body.projectid,
            projectName:req.body.projectName,
        }
    });
}


