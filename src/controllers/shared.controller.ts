
import { Request, Response, NextFunction } from "express";
import { IncomingMessage } from 'http';
import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { InstanceType } from "typegoose";

import { config } from '../config/config';
import { APIError } from '../helpers/APIError';
import OrderModel, { OrderItem } from '../models/order.model';

export let list = async (req, res, next) => {
    if (!req.body.payload) {
        const err = new APIError("orderIds not provided", httpStatus.BAD_REQUEST, true);
        return next(err);
    }
    const orders = await OrderModel.find({ $in: { orderid: req.body.payload } });
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

export default { list, load };