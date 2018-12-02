import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import https from 'https';
import { config } from '../config/config';
import uuid from 'uuid/v4';
import moment from 'moment';
import { createHmac } from 'crypto';

export let unifiedOrder = async (req, res, next) => {

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
    data.push({ key: 'mch_id', value: config.wx.mchId});
    data.push({ key: 'device_info', value: 'WEB'});
    data.push({ key: 'nonce_str', value: nonceStr});
    data.push({ key: 'body', value: "邻家工匠-订单支付"});
    data.push({ key: 'detail', value: ""});
    data.push({ key: 'out_trade_no', value: req.query.orderId});
    data.push({ key: 'fee_type', value: "CNY"});
    data.push({ key: 'total_fee', value: req.query.orderAmount});
    data.push({ key: 'spbill_create_ip', value: req.ip});
    data.push({ key: 'time_start', value: timeStart});
    data.push({ key: 'time_expire', value: timeExpire});
    data.push({ key: 'goods_tag', value: "" });
    data.push({ key: 'notify_url', value: config.wx.notifyUrl });
    data.push({ key: 'trade_type', value: "JSAPI" });
    data.push({ key: 'openid', value: req.user.wxOpenId });
    data.push({ key: 'trade_type', value: "JSAPI" });

    await createWxUnifiedOrder(data);

    return res.json({
        code: 0,
        message: "OK",
        data: {
            username: req.body.phoneNo
        }
    });
};

function createWxUnifiedOrder(data: any[]) {

    let dataToSign = data.filter(m => !!m).sort((l, r) => l.key < r.key ? 1 : -1).map(m => `${m.key}=${m.value}`).join("&");
    dataToSign += `key=${config.wx.mchKey}`;

    let hmac = createHmac("sha256", config.wx.mchKey);
    let sign = hmac.update(dataToSign).digest("hex");

    data.push({key: "sign_type", value: "HMAC-SHA256"});
    data.push({key: "sign", value: sign});

    const hostname = "api.mch.weixin.qq.com";
    const path = `/pay/unifiedorder`;
    console.log(hostname, path);

    return new Promise((resolve, reject) => {
        let request = https.request({
            hostname: hostname,
            port: 443,
            path: path,
            method: "POST",
        }, (wxRes) => {
            console.log("response from wx api.");

            let data = "";
            wxRes.on("data", (chunk) => {
                data += chunk;
            });

            wxRes.on("end", async () => {
                try {
                    let result = JSON.parse(data);

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

        request.end(data.map(m => `<${m.key}>${m.value}</${m.key}>`).join(""));
    });
}