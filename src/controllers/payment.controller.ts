import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import https from 'https';
import { config } from '../config/config';
import uuid from 'uuid/v4';
import moment from 'moment';
import { createHmac, createHash } from 'crypto';
import X2JS from 'x2js';
import { getJsApiTicket } from '../helpers/ticket';

const x2js = new X2JS();

export let createWxConfig = async (req, res, next) => {
    const timestamp = Math.floor(+new Date() / 1000).toString();
    const nonceStr = uuid().replace(/-/g, "");
    const signType = "HMAC-SHA256";
    const configParams = [];
    configParams.push({ key: "appId", value: config.wx.appId });
    configParams.push({ key: "timestamp", value: timestamp });
    configParams.push({ key: "nonceStr", value: nonceStr });
    configParams.push({ key: "signType", value: signType });
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
        signType: signType,
        signature: signature
    };

    return res.json({
        code: 0,
        message: 'OK',
        data: result
    });
};

export let createUnifiedOrder = async (req, res, next) => {

    let wxOpenId = req.body.wxOpenId;
    let user = req.user;

    if (!user) {
        const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
        return next(err);
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
    data.push({ key: 'out_trade_no', value: req.body.orderId });
    data.push({ key: 'fee_type', value: "CNY" });
    data.push({ key: 'total_fee', value: req.body.orderAmount || 1 });
    data.push({ key: 'spbill_create_ip', value: reqIP });
    data.push({ key: 'time_start', value: timeStart });
    data.push({ key: 'time_expire', value: timeExpire });
    data.push({ key: 'goods_tag', value: "goods1" });
    data.push({ key: 'notify_url', value: config.wx.notifyUrl });
    data.push({ key: 'trade_type', value: "JSAPI" });
    data.push({ key: 'openid', value: wxOpenId });
    data.push({ key: "sign_type", value: "HMAC-SHA256" });

    const result = await requestUnifiedOrderAsync(data).catch(error => {
        console.error(error);
    });

    if (!result || !result.prepay_id) {
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

    return res.json({
        code: 0,
        message: "OK",
        data: paymentParams
    });
};

function getSignature(data: any[], apiKey: string, signType: string = "HMAC-SHA256") {

    signType = signType.toUpperCase();

    let dataToSign = data.filter(m => !!m && !!m.value).sort((l, r) => l.key < r.key ? -1 : 1).map(m => `${m.key}=${m.value}`).join("&");
    let dataToSignWithApiKey = dataToSign + `&key=${apiKey}`;

    console.log("dataToSignWithApiKey:", dataToSignWithApiKey);

    if (signType == "HMAC-SHA256") {
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
        data.push({ key: "sign_type", value: "HMAC-SHA256" });

        let signature = getSignature(data, config.wx.mchKey);

        data.push({ key: "sign", value: signature });

        let xmlData = x2js.js2xml({
            xml: {
                mch_id: config.wx.mchId,
                nonce_str: nonceStr,
                sign_type: "HMAC-SHA256",
                sign: signature,
            }
        });
        request.end(xmlData);
    });
}

async function requestUnifiedOrderAsync(data: any[]): Promise<any> {

    let signature: string;
    if (config.wx.sandbox) {
        let sandboxKey = await getSandboxKeyAsync();
        signature = getSignature(data, sandboxKey);
    }
    else {
        // todo: for production use only.
        signature = getSignature(data, config.wx.mchKey);
    }

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
                    const { appid, device_info, mch_id, nonce_str, prepay_id, result_code, return_code, return_msg, sign, trade_type } = result.xml;

                    if (!prepay_id || (result_code !== "SUCCESS" && return_code !== "SUCCESS")) {
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

async function createWXPaymentParams(payload) {
    const packageStr = `prepay_id=${payload.prepay_id}`;
    const timestamp = Math.floor(+new Date() / 1000).toString();
    const nonceStr = uuid().replace(/-/g, "");
    const signType = "HMAC-SHA256";

    const data = [];
    data.push({ key: "appId", value: config.wx.appId });
    // ***danger! WTF... 微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
    data.push({ key: "timeStamp", value: timestamp });
    data.push({ key: "nonceStr", value: nonceStr });
    data.push({ key: "package", value: packageStr });
    data.push({ key: "signType", value: signType });

    let signature: string;
    if (config.wx.sandbox) {
        let sandboxKey = await getSandboxKeyAsync();
        signature = getSignature(data, sandboxKey, signType);
    }
    else {
        // todo: for production use only.
        signature = getSignature(data, config.wx.mchKey, signType);
    }

    return {
        appId: config.wx.appId,
        timeStamp: timestamp,
        nonceStr: nonceStr,
        package: packageStr,
        signType: signType,
        paySign: signature
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

    let signType = "HMAC-SHA256";
    let signature: string;
    if (config.wx.sandbox) {
        let sandboxKey = await getSandboxKeyAsync();
        signature = getSignature(payload, sandboxKey, signType);
    }
    else {
        // todo: for production use only.
        signature = getSignature(payload, config.wx.mchKey, signType);
    }

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

export default { createWxConfig, createUnifiedOrder, getWxSignature };