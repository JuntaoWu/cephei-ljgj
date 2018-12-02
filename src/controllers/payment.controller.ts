import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import https from 'https';
import { config } from '../config/config';
import uuid from 'uuid/v4';
import moment from 'moment';
import { createHmac } from 'crypto';
import xml2json from 'xml2json';

export let createUnifiedOrder = async (req, res, next) => {

    let wxOpenId = req.body.wxOpenId;
    let user = req.user;

    if (!user) {
        const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
        return next(err);
    }

    let data = [];
    let nonceStr = uuid().replace(/-/g, '');
    let timeStart = moment().format("YYYYMMDDHHmmss");
    let timeExpire = moment().add(15, "minutes").format("YYYYMMDDHHmmss");
    data.push({ key: 'appid', value: config.wx.appId });
    data.push({ key: 'mch_id', value: config.wx.mchId });
    data.push({ key: 'device_info', value: 'WEB' });
    data.push({ key: 'nonce_str', value: nonceStr });
    data.push({ key: 'body', value: "邻家工匠-订单支付" });
    data.push({ key: 'detail', value: "" });
    data.push({ key: 'out_trade_no', value: req.body.orderId });
    data.push({ key: 'fee_type', value: "CNY" });
    data.push({ key: 'total_fee', value: req.body.orderAmount || 0.01 });
    data.push({ key: 'spbill_create_ip', value: req.ip });
    data.push({ key: 'time_start', value: timeStart });
    data.push({ key: 'time_expire', value: timeExpire });
    data.push({ key: 'goods_tag', value: "" });
    data.push({ key: 'notify_url', value: config.wx.notifyUrl });
    data.push({ key: 'trade_type', value: "JSAPI" });
    data.push({ key: 'openid', value: wxOpenId });

    const result = await createWxUnifiedOrder(data);

    return res.json({
        code: 0,
        message: "OK",
        data: result
    });
};

function createWxUnifiedOrder(data: any[]) {

    let dataToSign = data.filter(m => !!m).sort((l, r) => l.key < r.key ? 1 : -1).map(m => `${m.key}=${m.value}`).join("&");
    dataToSign += `key=${config.wx.mchKey}`;

    let hmac = createHmac("sha256", config.wx.mchKey);
    let sign = hmac.update(dataToSign).digest("hex");

    data.push({ key: "sign_type", value: "HMAC-SHA256" });
    data.push({ key: "sign", value: sign });

    const hostname = "api.mch.weixin.qq.com";
    const path = `/sandboxnew/pay/unifiedorder`;
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
                console.log(wxData);
                try {
                    let result = xml2json.toJson(wxData, {
                        object: true
                    }) as any;

                    console.log(result);

                    const { openid } = result;

                    if (!openid) {
                        return reject(result);
                    }
                    else {
                        return resolve(result);
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

export default { createUnifiedOrder };