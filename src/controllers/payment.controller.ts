import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import https from 'https';
import { config } from '../config/config';
import uuid from 'uuid/v4';
import moment from 'moment';
import { createHmac, createHash } from 'crypto';
import X2JS from 'x2js';
import { getJsApiTicket } from '../helpers/ticket';
import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
import PaymentModel, { Payment, PaymentStatus } from '../models/payment.model';
import OrderItemModel, { OrderStatus } from '../models/order.model';
import { funditem } from '../models/funditem.model';
import funditemModel from '../models/funditem.model';

const x2js = new X2JS();
const secureSignType = 'HMAC-SHA256';

export let createWxConfig = async (req, res, next) => {
    const timestamp = Math.floor(+new Date() / 1000).toString();
    const nonceStr = uuid().replace(/-/g, "");
    const configParams = [];
    configParams.push({ key: "appId", value: config.wx.appId });
    configParams.push({ key: "timestamp", value: timestamp });
    configParams.push({ key: "nonceStr", value: nonceStr });
    configParams.push({ key: "signType", value: secureSignType });
    configParams.push({ key: "url", value: decodeURIComponent(req.body.url) });

    const signature = await createWxSignatureAsync(configParams).catch(error => {
        console.error(error);
    });

    if (!signature) {
        const err = new APIError("createWxSignature error", httpStatus.INTERNAL_SERVER_ERROR);
        return next(err);
    }

    const result = {
        appId: config.wx.appId,
        timestamp: timestamp,
        nonceStr: nonceStr,
        signType: secureSignType,
        signature: signature
    };

    return res.json({
        code: 0,
        message: 'OK',
        data: result
    });
};

export let createUnifiedOrderByFundItem = async (req, res, next) => {
    const tradeType = 'NATIVE';
    // check whether the order had been paid or not.
    let fundItem: funditem = await funditemModel.findOne({
        fundItemId: req.body.fundItemId
    });
    if (!fundItem) {
        // Cannot find proper fundItem to pay.
        const err = new APIError('Unable to find fundItem', httpStatus.NOT_FOUND, true);
        return next(err);
    }

    // check whether the order had been paid or not.
    let orderItem = await OrderItemModel.findOne({
        orderid: fundItem.orderid
    });
    if (!orderItem || (orderItem.orderStatus != OrderStatus.Preparing && orderItem.orderStatus != OrderStatus.InProgress)) {
        // Cannot find proper orderItem to pay.
        const err = new APIError('Unable to find orderItem', httpStatus.NOT_FOUND, true);
        return next(err);
    }

    let existingPayments = await PaymentModel.find({
        orderId: req.body.orderId,
    });

    let paidAlready = _(existingPayments.filter(i => i.status == PaymentStatus.Completed)).sumBy("totalFee");
    let totalFee = Math.floor(+orderItem.orderAmount * 100);
    let remainTotalFee = totalFee - paidAlready;
    console.log("paidAlready, totalFee, remainTotalFee:", paidAlready, totalFee, remainTotalFee);

    if (remainTotalFee <= 0) {
        // Cannot find proper orderItem to pay.
        const err = new APIError('Total fee is 0.', httpStatus.NOT_FOUND, true);
        return next(err);
    }

    let fundItemFeeToPay = Math.floor(+fundItem.fundItemAmount * 100);
    let outTradeNo = `${orderItem.orderid}-${existingPayments.length}`;

    const reqIP = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    let data = [];
    let nonceStr = uuid().replace(/-/g, '');
    let timeStart = moment().format("YYYYMMDDHHmmss");
    let timeExpire = moment().add(15, "minutes").format("YYYYMMDDHHmmss");
    data.push({ key: 'appid', value: config.wx.appId });
    data.push({ key: 'mch_id', value: config.wx.mchId });
    data.push({ key: 'device_info', value: 'NATIVE' });
    data.push({ key: 'nonce_str', value: nonceStr });
    data.push({ key: 'body', value: "邻家工匠-订单支付" });
    data.push({ key: 'detail', value: "detail" });
    data.push({ key: 'out_trade_no', value: outTradeNo });
    data.push({ key: 'fee_type', value: "CNY" });
    data.push({ key: 'total_fee', value: fundItemFeeToPay });
    data.push({ key: 'spbill_create_ip', value: reqIP });
    data.push({ key: 'time_start', value: timeStart });
    data.push({ key: 'time_expire', value: timeExpire });
    data.push({ key: 'goods_tag', value: orderItem.gServiceItemid });
    data.push({ key: 'notify_url', value: config.wx.notifyUrl });
    data.push({ key: 'trade_type', value: tradeType });

    data.push({ key: "sign_type", value: secureSignType });

    const result = await requestUnifiedOrderAsync(data).catch(error => {
        console.error(error);
    });

    if (!result || !result.prepay_id || !result.code_url) {

        if (result && result.err_code) {
            console.error(result.err_code, result.err_code_des);
            if (result.err_code == "ORDERPAID") {
                // now change paymentModel's status.
                // todo: check the sign.
                let payment = await PaymentModel.findOne({ outTradeNo: outTradeNo });
                payment.status = PaymentStatus.Completed;
                // even we know it's paid already, but since we missed out the wxNotify, so we cannot track this payment anymore.
                // todo: actively query wx payment via wxapi.
                await payment.save();
            }

            const err = new APIError(result.err_code_des, httpStatus.INTERNAL_SERVER_ERROR, true);
            return next(err);
        }

        const err = new APIError('requestUnifiedOrder error', httpStatus.INTERNAL_SERVER_ERROR, true);
        return next(err);
    }

    // todo: create params for chooseWXPay
    const paymentParams = await createWXPaymentParams(result).catch(error => {
        console.error(error);
    });

    if (!paymentParams) {
        const err = new APIError('createWXPaymentParams error', httpStatus.INTERNAL_SERVER_ERROR, true);
        return next(err);
    }

    // save the current payment in db.
    const payment = new PaymentModel({
        appId: config.wx.appId,
        feeType: "CNY",
        mchId: config.wx.mchId,
        openId: '',
        orderId: orderItem.orderid,
        outTradeNo: outTradeNo,
        totalFee: fundItemFeeToPay,
        tradeType: tradeType,
        status: PaymentStatus.Waiting,
        fundItemId: fundItem.fundItemId,
    });
    const savedPayment = await payment.save().catch(error => {
        console.error(error);
    });

    if(!savedPayment) {
        const err = new APIError('payment.save() error', httpStatus.INTERNAL_SERVER_ERROR, true);
        return next(err);
    }

    return res.json({
        code: 0,
        message: "OK",
        data: result.code_url
    });
}

export let createUnifiedOrder = async (req, res, next) => {

    let user = req.user;

    if (!user) {
        const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
        return next(err);
    }

    let wxOpenId = req.body.wxOpenId;
    let tradeType = req.body.tradeType;

    // check whether the order had been paid or not.
    let orderItem = await OrderItemModel.findOne({
        orderid: req.body.orderId
    });
    if (!orderItem || (orderItem.orderStatus != OrderStatus.Preparing && orderItem.orderStatus != OrderStatus.InProgress)) {
        // Cannot find proper orderItem to pay.
        const err = new APIError('Unable to find orderItem', httpStatus.NOT_FOUND, true);
        return next(err);
    }

    let existingPayments = await PaymentModel.find({
        orderId: req.body.orderId,
    });

    // Check if some payment status had not been updated.
    const inCompletedPayments = existingPayments.filter(i => i.status != PaymentStatus.Completed);
    // We'd like to await all of the queryUnifiedOrderAsync;
    for (let i of inCompletedPayments) {
        const wxPayment = await queryUnifiedOrderAsync({
            transactionId: i.transactionId,
            outTradeNo: i.outTradeNo,
        });

        if (!wxPayment) {
            console.error("queryUnifiedOrderAsync failed.", i.transactionId, i.outTradeNo);
            return;
        }

        const {
            appid, mch_id, nonce_str, sign, return_code, result_code, err_code, err_code_des,
            out_trade_no, attach,
            device_info, openid, is_subscribe, trade_type, trade_state, bank_type, total_fee, settlement_total_fee, fee_type, cash_fee, cash_fee_type, coupon_fee, coupon_count, transaction_id, time_end, trade_state_desc,
        } = wxPayment;

        if (return_code == 'SUCCESS') {
            if (err_code) {
                console.error(err_code, err_code_des);
                i.errCode = err_code;
                i.errCodeDes = err_code_des;
                if (i.errCode == 'ORDERNOTEXIST') {
                    i.status = PaymentStatus.Exception;
                }
            }

            if (result_code == 'SUCCESS') {
                i.attach = attach;
                if (trade_state == 'SUCCESS') {
                    if (i.totalFee != total_fee) {
                        // todo: error.
                    }
                    // todo: check the sign.
                    // now update payment in db.
                    i.nonceStr = nonce_str;
                    i.openId = openid;
                    i.isSubscribe = is_subscribe;
                    i.tradeType = trade_type;
                    i.bankType = bank_type;
                    i.settlementTotalFee = settlement_total_fee;
                    i.feeType = fee_type;
                    i.cashFee = cash_fee;
                    i.couponFee = coupon_fee;
                    i.couponCount = coupon_count;
                    i.transactionId = transaction_id;
                    i.timeEnd = time_end;
                    i.status = PaymentStatus.Completed;
                }
                else {
                    switch (trade_state) {
                        case 'NOTPAY':
                        case 'USERPAYING':
                            i.status = PaymentStatus.Waiting;
                            break;
                        case 'CLOSED':
                        case 'REVOKED':
                            i.status = PaymentStatus.Closed;
                            break;
                        case 'PAYERROR':
                            i.status = PaymentStatus.Exception;
                            break;
                        case 'REFUND':
                            // ...handle refund workflow.
                            break;
                    }
                }
            }

            await i.save();
        }
    }

    let paidAlready = _(existingPayments.filter(i => i.status == PaymentStatus.Completed)).sumBy("totalFee");
    let totalFee = Math.floor(+orderItem.orderAmount * 100);
    let remainTotalFee = totalFee - paidAlready;
    console.log("paidAlready, totalFee, remainTotalFee:", paidAlready, totalFee, remainTotalFee);

    if (remainTotalFee <= 0) {
        // Cannot find proper orderItem to pay.
        const err = new APIError('Total fee is 0.', httpStatus.NOT_FOUND, true);
        return next(err);
    }

    let waitingPayment = existingPayments.filter(i => i.status == PaymentStatus.Waiting).find(i => i.totalFee == remainTotalFee);

    let outTradeNo = `${orderItem.orderid}-${existingPayments.length}`;
    if (waitingPayment) {
        outTradeNo = waitingPayment.outTradeNo.toString();
    }

    const reqIP = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    let data = [];
    let nonceStr = uuid().replace(/-/g, '');
    let timeStart = moment().format("YYYYMMDDHHmmss");
    let timeExpire = moment().add(15, "minutes").format("YYYYMMDDHHmmss");
    data.push({ key: 'appid', value: config.wx.appId });
    data.push({ key: 'mch_id', value: config.wx.mchId });
    data.push({ key: 'device_info', value: 'WEB' });
    data.push({ key: 'nonce_str', value: nonceStr });
    data.push({ key: 'body', value: "邻家工匠-订单支付" });
    data.push({ key: 'detail', value: "detail" });
    data.push({ key: 'out_trade_no', value: outTradeNo });
    data.push({ key: 'fee_type', value: "CNY" });
    data.push({ key: 'total_fee', value: remainTotalFee });
    data.push({ key: 'spbill_create_ip', value: reqIP });
    data.push({ key: 'time_start', value: timeStart });
    data.push({ key: 'time_expire', value: timeExpire });
    data.push({ key: 'goods_tag', value: orderItem.gServiceItemid });
    data.push({ key: 'notify_url', value: config.wx.notifyUrl });
    data.push({ key: 'trade_type', value: tradeType });
    if (wxOpenId) {
        data.push({ key: 'openid', value: wxOpenId });
    }
    data.push({ key: "sign_type", value: secureSignType });

    const result = await requestUnifiedOrderAsync(data).catch(error => {
        console.error(error);
    });

    if (!result || !result.prepay_id) {

        if (result && result.err_code) {
            console.error(result.err_code, result.err_code_des);
            if (result.err_code == "ORDERPAID") {
                // now change paymentModel's status.
                // todo: check the sign.
                let payment = await PaymentModel.findOne({ outTradeNo: outTradeNo });
                payment.status = PaymentStatus.Completed;
                // even we know it's paid already, but since we missed out the wxNotify, so we cannot track this payment anymore.
                // todo: actively query wx payment via wxapi.
                await payment.save();
            }

            const err = new APIError(result.err_code_des, httpStatus.INTERNAL_SERVER_ERROR, true);
            return next(err);
        }

        const err = new APIError('requestUnifiedOrder error', httpStatus.INTERNAL_SERVER_ERROR, true);
        return next(err);
    }

    // todo: create params for chooseWXPay
    const paymentParams = await createWXPaymentParams(result).catch(error => {
        console.error(error);
    });

    if (!paymentParams) {
        const err = new APIError('createWXPaymentParams error', httpStatus.INTERNAL_SERVER_ERROR, true);
        return next(err);
    }

    if (!waitingPayment) {
        // save the current payment in db.
        const payment = new PaymentModel({
            appId: config.wx.appId,
            feeType: "CNY",
            mchId: config.wx.mchId,
            openId: wxOpenId,
            orderId: orderItem.orderid,
            outTradeNo: outTradeNo,
            totalFee: remainTotalFee,
            tradeType: tradeType,
            status: PaymentStatus.Waiting,
        });
        await payment.save();
    }

    return res.json({
        code: 0,
        message: "OK",
        data: paymentParams
    });
};

export let wxNotify = async (req: Request, res: Response, next: NextFunction) => {
    /**
     * <xml>
        <appid><![CDATA[wx2421b1c4370ec43b]]></appid>
        <attach><![CDATA[支付测试]]></attach>
        <bank_type><![CDATA[CFT]]></bank_type>
        <fee_type><![CDATA[CNY]]></fee_type>
        <is_subscribe><![CDATA[Y]]></is_subscribe>
        <mch_id><![CDATA[10000100]]></mch_id>
        <nonce_str><![CDATA[5d2b6c2a8db53831f7eda20af46e531c]]></nonce_str>
        <openid><![CDATA[oUpF8uMEb4qRXf22hE3X68TekukE]]></openid>
        <out_trade_no><![CDATA[1409811653]]></out_trade_no>
        <result_code><![CDATA[SUCCESS]]></result_code>
        <return_code><![CDATA[SUCCESS]]></return_code>
        <sign><![CDATA[B552ED6B279343CB493C5DD0D78AB241]]></sign>
        <sub_mch_id><![CDATA[10000100]]></sub_mch_id>
        <time_end><![CDATA[20140903131540]]></time_end>
        <total_fee>1</total_fee>
        <coupon_fee_0><![CDATA[10]]></coupon_fee_0>
        <coupon_count><![CDATA[1]]></coupon_count>
        <coupon_type><![CDATA[CASH]]></coupon_type>
        <coupon_id><![CDATA[10000]]></coupon_id> 
        <trade_type><![CDATA[JSAPI]]></trade_type>
        <transaction_id><![CDATA[1004400740201409030005092168]]></transaction_id>
        </xml>
     */
    if (req.body) {
        try {
            console.log("wxNotify body:", req.body);
            const result = x2js.xml2js(req.body) as any;
            if (!result || !result.xml) {
                console.error("wxNotify", result);
                const err = new APIError("Notify format error, failed.", httpStatus.FORBIDDEN);
                return next(err);
            }

            // todo: checkSign
            const {
                appid, attach, bank_type, fee_type, is_subscribe,
                mch_id, nonce_str, openid,
                out_trade_no,
                result_code, return_code, sign, sub_mch_id, time_end,
                total_fee, settlement_total_fee, cash_fee,
                coupon_fee,
                coupon_count,
                coupon_type,
                coupon_id,
                trade_type, transaction_id,
                err_code, err_code_des,
            } = result.xml;

            let returnData =
                `<xml>
                    <return_code><![CDATA[SUCCESS]]></return_code>
                    <return_msg><![CDATA[OK]]></return_msg>
                </xml>`;

            if (return_code != "SUCCESS") {
                // todo: payment failed.
                console.log(result.return_msg);
                return res.end(returnData);
            }

            let payment = await PaymentModel.findOne({ outTradeNo: out_trade_no })
                .catch(error => {
                    console.error(error);
                    return undefined;
                });

            if (payment && (payment.status == PaymentStatus.Completed || payment.status == PaymentStatus.Closed)) {
                return res.end(returnData);
            }

            const data = _.entries(result.xml).filter(pair => pair[0] !== "sign").map(pair => {
                return { key: pair[0], value: pair[1] };
            });

            const signature = await getSignatureBasedOnEnv(data);

            if (signature == sign) {
                // todo: save business data.
                if (!payment) {
                    payment = new PaymentModel({
                        appId: appid,
                        attach: attach,
                        bankType: bank_type,
                        feeType: fee_type,
                        isSuscribe: is_subscribe,
                        mchId: mch_id,
                        nonceStr: nonce_str,
                        openId: openid,
                        outTradeNo: out_trade_no,
                        subMchId: sub_mch_id,
                        timeEnd: time_end,
                        totalFee: total_fee,
                        settlementTotalFee: settlement_total_fee,
                        cashFee: cash_fee,
                        couponFee: coupon_fee,
                        couponCount: coupon_count,
                        couponType: coupon_type,
                        couponId: coupon_id,
                        tradeType: trade_type,
                        transactionId: transaction_id,
                        status: result_code == "SUCCESS" ? PaymentStatus.Completed : PaymentStatus.Exception,
                        errCode: err_code,
                        errCodeDes: err_code_des,
                    });
                }
                else {
                    if (payment.totalFee != total_fee || result_code != "SUCCESS") {
                        payment.status = PaymentStatus.Exception;
                    }
                    else {
                        payment.status = PaymentStatus.Completed;
                    }
                    payment.attach = attach;
                    payment.bankType = bank_type;
                    payment.feeType = fee_type;
                    payment.isSubscribe = is_subscribe;
                    payment.nonceStr = nonce_str;
                    payment.openId = openid;
                    payment.timeEnd = time_end;
                    payment.totalFee = total_fee;
                    payment.settlementTotalFee = settlement_total_fee;
                    payment.cashFee = cash_fee;
                    payment.couponFee = coupon_fee;
                    payment.couponCount = coupon_count;
                    payment.couponType = coupon_type;
                    payment.couponId = coupon_id;
                    payment.tradeType = trade_type;
                    payment.transactionId = transaction_id;
                    payment.errCode = err_code;
                    payment.errCodeDes = err_code_des;
                }
                await payment.save();
                return res.end(returnData);
            }
            else {
                console.error("Check Signature failed.");
                const err = new APIError("Check Signature failed.", httpStatus.FORBIDDEN);
                return next(err);
            }
        }
        catch (error) {
            console.error(error);
            const err = new APIError("handle wxNotify error.", httpStatus.INTERNAL_SERVER_ERROR);
            return next(err);
        }
    }

    return res.end();
};

function getSignature(data: any[], apiKey: string, signType: string = secureSignType) {

    signType = signType.toUpperCase();

    let dataToSign = data.filter(m => !!m && !!m.value).sort((l, r) => l.key < r.key ? -1 : 1).map(m => `${m.key}=${m.value}`).join("&");
    let dataToSignWithApiKey = dataToSign + `&key=${apiKey}`;

    console.log("dataToSignWithApiKey:", dataToSignWithApiKey);

    if (signType == secureSignType) {
        let hmac = createHmac("sha256", apiKey);
        let signature = hmac.update(dataToSignWithApiKey).digest("hex").toUpperCase();
        console.log("signature:", signature);
        return signature;
    }
    else {
        let hash = createHash(signType);
        let signature = hash.update(dataToSignWithApiKey).digest("hex").toUpperCase();
        console.log("signature:", signature);
        return signature;
    }
}

async function getSandboxKeyAsync(): Promise<string> {
    // https://api.mch.weixin.qq.com/sandboxnew/pay/getsignkey
    const hostname = "api.mch.weixin.qq.com";
    const path = "/sandboxnew/pay/getsignkey";

    return new Promise<string>((resolve, reject) => {
        let request = https.request({
            hostname: hostname,
            port: 443,
            path: path,
            method: "POST",
        }, (wxRes) => {
            console.log("response from wx api.");

            let wxData = "";
            wxRes.on("data", (chunk) => {
                wxData += chunk;
            });

            wxRes.on("end", async () => {
                let result = x2js.xml2js(wxData) as any;
                return resolve(result.xml.sandbox_signkey);
            });
        });

        let nonceStr = uuid().replace(/-/g, '');

        let data = [];
        data.push({ key: "mch_id", value: config.wx.mchId });
        data.push({ key: "nonce_str", value: nonceStr });
        data.push({ key: "sign_type", value: secureSignType });

        let signature = getSignature(data, config.wx.mchKey);

        data.push({ key: "sign", value: signature });

        let xmlData = x2js.js2xml({
            xml: {
                mch_id: config.wx.mchId,
                nonce_str: nonceStr,
                sign_type: secureSignType,
                sign: signature,
            }
        });
        request.end(xmlData);
    });
}

async function requestUnifiedOrderAsync(data: any[]): Promise<any> {

    const signature = await getSignatureBasedOnEnv(data);

    data.push({ key: "sign", value: signature });

    const hostname = "api.mch.weixin.qq.com";
    const path = config.wx.sandbox ? `/sandboxnew/pay/unifiedorder` : `/pay/unifiedorder`;
    console.log(hostname, path);

    return new Promise((resolve, reject) => {
        let request = https.request({
            hostname: hostname,
            port: 443,
            path: path,
            method: "POST",
        }, (wxRes) => {
            console.log("response from wx api.");

            let wxData = "";
            wxRes.on("data", (chunk) => {
                wxData += chunk;
            });

            wxRes.on("end", async () => {
                try {
                    let result = x2js.xml2js(wxData) as any;

                    console.log(result.xml);

                    /**
                     * appid:"wx71d891c65b74dc55"
                        device_info:"WEB"
                        mch_id:"1513374541"
                        nonce_str:"zZJPVM9LA8URHtVa"
                        prepay_id:"wx03134916119222b25b00c3a50940718873"
                        result_code:"SUCCESS"
                        return_code:"SUCCESS"
                        return_msg:"OK"
                        sign:"82C418204B889E1356A17A5D2553AA46C1812B7EDFB6520FDE68524BE4850516"
                        trade_type:"JSAPI"
                     */
                    const { appid, device_info, mch_id, nonce_str, prepay_id, result_code, return_code, return_msg, sign, trade_type, err_code, err_code_des, mweb_url } = result.xml;

                    if (result_code !== "SUCCESS" && return_code !== "SUCCESS") {
                        return reject(result.xml);
                    }
                    else {
                        return resolve(result.xml);
                    }
                } catch (ex) {
                    return reject(ex);
                }
            });
        });

        let dataToPost = data.map(m => `<${m.key}>${m.value}</${m.key}>`).join("");
        console.log(dataToPost);
        request.end(`<xml>${dataToPost}</xml>`);
    });
}

async function queryUnifiedOrderAsync(orderInfo): Promise<any> {
    // https://api.mch.weixin.qq.com/pay/orderquery
    let data = [];
    let nonceStr = uuid().replace(/-/g, '');
    let signType = secureSignType;
    data.push({ key: 'appid', value: config.wx.appId });
    data.push({ key: 'mch_id', value: config.wx.mchId });
    if (orderInfo.transactionId) {
        data.push({ key: 'transaction_id', value: orderInfo.transactionId })
    }
    else {
        data.push({ key: 'out_trade_no', value: orderInfo.outTradeNo });
    }
    data.push({ key: 'nonce_str', value: nonceStr });
    data.push({ key: "sign_type", value: signType });

    const signature = await getSignatureBasedOnEnv(data, signType);

    let dataToPost = {
        appid: config.wx.appId,
        mch_id: config.wx.mchId,
        nonce_str: nonceStr,
        sign_type: signType,
        sign: signature,
    } as any;
    if (orderInfo.transactionId) {
        dataToPost.transaction_id = orderInfo.transactionId;
    }
    else {
        dataToPost.out_trade_no = orderInfo.outTradeNo;
    }

    // https://api.mch.weixin.qq.com/pay/orderquery
    const hostname = "api.mch.weixin.qq.com";
    const path = "/pay/orderquery";

    return new Promise<string>((resolve, reject) => {
        let request = https.request({
            hostname: hostname,
            port: 443,
            path: path,
            method: "POST",
        }, (wxRes) => {
            console.log("response from wx api.");

            let wxData = "";
            wxRes.on("data", (chunk) => {
                wxData += chunk;
            });

            wxRes.on("end", async () => {
                let result = x2js.xml2js(wxData) as any;
                return resolve(result.xml);
            });
        });

        let xmlData = x2js.js2xml({
            xml: dataToPost
        });
        request.end(xmlData);
    });
}

async function getSignatureBasedOnEnv(data, signType?: string) {
    let signature: string;
    if (config.wx.sandbox) {
        let sandboxKey = await getSandboxKeyAsync();
        signature = getSignature(data, sandboxKey, signType);
    }
    else {
        // todo: for production use only.
        signature = getSignature(data, config.wx.mchKey, signType);
    }
    return signature;
}

async function createWXPaymentParams(payload) {
    const packageStr = `prepay_id=${payload.prepay_id}`;
    const timestamp = Math.floor(+new Date() / 1000).toString();
    const nonceStr = uuid().replace(/-/g, "");
    const signType = secureSignType;

    const data = [];
    data.push({ key: "appId", value: config.wx.appId });
    // ***danger! WTF... 微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
    data.push({ key: "timeStamp", value: timestamp });
    data.push({ key: "nonceStr", value: nonceStr });
    data.push({ key: "package", value: packageStr });
    data.push({ key: "signType", value: signType });

    const signature = await getSignatureBasedOnEnv(data, signType);

    return {
        appId: config.wx.appId,
        timeStamp: timestamp,
        nonceStr: nonceStr,
        package: packageStr,
        signType: signType,
        paySign: signature,
        mweb_url: payload.mweb_url,  // If we're using MWEB payment.
    };
}

async function createWxSignatureAsync(payload) {
    let ticket = await getJsApiTicket().catch(error => {
        console.error(error);
    });
    if (!ticket) {
        return;
    }

    payload.push({ key: "jsapi_ticket", value: ticket });
    const urlIndex = (payload as any[]).findIndex(i => i.key == "url");
    if (urlIndex != -1) {
        payload[urlIndex].value = decodeURIComponent(payload[urlIndex].value);
    }

    const signature = await getSignatureBasedOnEnv(payload, secureSignType);

    return signature;
}

export let getWxSignature = async (req, res, next) => {
    console.log("getWxSignature", req.body.payload);

    let data = req.body.payload;
    const signature = await createWxSignatureAsync(data).catch(error => {
        console.error(error);
    });

    if (!signature) {
        const err = new APIError("createWxSignature error", httpStatus.INTERNAL_SERVER_ERROR);
        return next(err);
    }

    return res.json({
        code: 0,
        message: "OK",
        data: {
            signature: signature
        }
    });
};

export default { createWxConfig, createUnifiedOrderByFundItem, createUnifiedOrder, getWxSignature, wxNotify };