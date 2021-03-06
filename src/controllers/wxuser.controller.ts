import config from "../config/config";
import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from "express";
import APIError from "../helpers/APIError";

export let authorize = (req, res, next) => {
    return res.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.wx.appId}&redirect_uri=${config.wx.redirectUrl}&response_type=code&scope=snsapi_userinfo&state=${encodeURIComponent(req.query.state)}#wechat_redirect`);
};

export let login = (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
        res.cookie('wxOpenId', req.user.wxOpenId);
        let redirectUrl = decodeURIComponent(req.query.state);
        console.log('state:', redirectUrl);
        if (/\?/.test(redirectUrl)) {
            redirectUrl += `&wxOpenId=${req.user.wxOpenId}`;
        }
        else if (/#/.test(redirectUrl)) {
            redirectUrl = redirectUrl.replace(/(.*)#([^#]*)/, `$1?wxOpenId=${req.user.wxOpenId}#$2`);
        }
        else {
            redirectUrl += `?wxOpenId=${req.user.wxOpenId}`;
        }
        console.log('redirectTo:', redirectUrl);
        return res.redirect(redirectUrl);
    }

    const error = new APIError("Cannot resolve user info", 401);
    return next(error);
};

export default { authorize, login };