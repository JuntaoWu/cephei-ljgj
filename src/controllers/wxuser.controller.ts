import config from "../config/config";
import * as jwt from 'jsonwebtoken';

export let authorize = (req, res, next) => {
    return res.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.wx.appId}&redirect_uri=${config.wx.redirectUrl}&response_type=code&scope=snsapi_userinfo&state=${req.query.id}#wechat_redirect`);
};

export let login = (req, res, next) => {
    if (req.user) {
        const token = jwt.sign({
            userId: req.user.userId,
            wxgameOpenId: req.user.wxgameOpenId,
            nativeOpenId: req.user.nativeOpenId,
            unionId: req.user.unionId  // if we do not have unionId here, the token will not be any use.
        }, config.jwtSecret);

        return res.json({
            error: false,
            message: "OK",
            data: {
                token,
                userId: req.user.userId,
                wxgameOpenId: req.user.wxgameOpenId,
                nativeOpenId: req.user.nativeOpenId,
                unionId: req.user.unionId,
                session_key: req.user.session_key,
                nickName: req.user.nickName,
                avatarUrl: req.user.avatarUrl,
                anonymous: req.user.anonymous,
            }
        });
    }
};

export default { authorize, login };