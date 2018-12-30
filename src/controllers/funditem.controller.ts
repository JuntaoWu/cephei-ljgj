
import * as _ from 'lodash';
import moment from 'moment';
import funditemModel, { FundStatus } from '../models/funditem.model';
import orderModel, { OrderItem, shotOrderItem, OrderStatus } from '../models/order.model';

/**
 * 创建一个项目款项
 * @param req 
 * @param res 
 * @param next 
 */
export let createOneFundItem = async (req, res, next) => {

    let orderobj = await orderModel.findOne({ orderid: req.body.orderid });
    if(orderobj.orderAmount<=10 || req.body.fundItemAmount>orderobj.orderAmount )
    {
        return res.json({
            error: true,
            message: "order status is initializing . or orderamount is error !",
            data: {
                orderid: req.body.orderid
            }
        });
    }

    let fundItemId = "FUND_" + _.random(10000, 99999)  + moment(new Date()).format("YYYYMMDDHHmm");//("YYYYMMDDHHmm");

    let fundItem = new funditemModel({
        fundItemId: fundItemId,
        orderid: req.body.orderid,
        fundItemType:1,
        fundItemAmount: req.body.fundItemAmount,
        fundItemStatus: FundStatus.UnPaid
    });

    let fundobj = await fundItem.save();

    return res.json({
        error: false,
        message: "OK",
        data: {
            fundItemId:fundItemId,
            orderid: req.body.orderid
        }
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
    let fundItems = await funditemModel.find({ orderid: req.query.orderid });

    let funds = [];
    if(!fundItems)
    {   
        return fundItems.map(m => {
            let result = {
                fundItemType: m.fundItemType,
                fundItemAmount: m.fundItemAmount,
                fundItemStatus: m.fundItemStatus
            }
            funds.push(result);
            return result;
        });
    }
    else
    {
        return res.json({
            error: true,
            message: "error : get fund items error",
            data: {
                orderid: req.body.orderid
            }
        });
    }
   
}

export default { getFundItems, createOneFundItem};