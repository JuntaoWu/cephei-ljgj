
import * as _ from 'lodash';
import moment from 'moment';
import funditemModel, { FundStatus } from '../models/funditem.model';
import orderModel, { OrderItem, shotOrderItem, OrderStatus } from '../models/order.model';
import APIError from '../helpers/APIError';
import * as httpStatus from 'http-status';

/**
 * 创建一个项目款项
 * @param req 
 * @param res 
 * @param next 
 */
export let createOneFundItem = async (req, res, next) => {

    let orderobj = await orderModel.findOne({ orderid: req.body.orderId });
    if (req.body.fundItemAmount > orderobj.orderAmount) {
        return res.json({
            error: true,
            message: "order status is initializing . or orderamount is error !",
            data: {
                orderid: req.body.orderid
            }
        });
    }

    let fundItemId = "FUND_" + _.random(10000, 99999) + moment(new Date()).format("YYYYMMDDHHmm");//("YYYYMMDDHHmm");

    let fundItem = new funditemModel({
        fundItemId: fundItemId,
        orderid: req.body.orderId,
        fundItemType: req.body.fundItemType,
        fundItemAmount: +req.body.fundItemAmount,
        fundItemStatus: FundStatus.Waiting
    });

    let fundobj = await fundItem.save();

    return res.json({
        code: 0,
        message: "OK",
        data: {
            fundItemId: fundItemId,
            orderid: req.body.orderId
        }
    });
}

export let revokeOrderFundItem = async (req, res, next) => {
    let fundItem = await funditemModel.findOne({ fundItemId: req.body.fundItemId });
    if (!fundItem) {
        const error = new APIError('Cannot find fundItem', httpStatus.NOT_FOUND, true);
        return next(error);
    }

    fundItem.fundItemStatus = FundStatus.Closed;

    await fundItem.save();

    return res.json({
        code: 0,
        message: "OK",
        data: fundItem
    });
}

/**
 * 根据group id 返回给指定团购小区页面。
 * @param req 
 * 
 * @param res 
 * @param next 
 */
export let getFundItems = async (req, res, next) => {
    let orderinfo = await orderModel.findOne({ orderid: req.query.orderid });
    let fundItems = await funditemModel.find({ orderid: req.query.orderid });

    if (fundItems && orderinfo) {
        const funds = fundItems.map(m => {
            let result = {
                fundItemId:m.fundItemId,
                fundItemType: m.fundItemType,
                fundItemAmount: m.fundItemAmount,
                fundItemStatus: m.fundItemStatus
            }
            return result;
        });
        return res.json({
            code: 0,
            message: "OK",
            data: {
                orderAmount: orderinfo.orderAmount,
                orderPaymentStatus: orderinfo.paymentStatus,
                fundItems: funds
            }
        });
    }
    else {
        return res.json({
            code: 500,
            message: "error : get fund items error",
            data: {
                orderid: req.body.orderid
            }
        });
    }

}

export default { getFundItems, createOneFundItem, revokeOrderFundItem };