import * as passport from 'passport';
import User from '../models/user.model';
import { Strategy as JwtStrategy, StrategyOptions } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy, IStrategyOptionsWithRequest } from 'passport-local';
import { Strategy as AnonymousStrategy } from 'passport-anonymous';
import https from 'https';

import speakeasy from 'speakeasy';

import config from './config';
import UserModel from '../models/user.model';
// Setting username field to phoneNo rather than username
const localOptions: IStrategyOptionsWithRequest = {
    usernameField: 'phoneNo',
    passwordField: 'verificationCode',
    passReqToCallback: true,
};

// Setting up local login strategy
const localLogin = new LocalStrategy(localOptions, (req, username, password, done) => {
    console.log("localLogin");
    User.findOne({ username: username }, async (err, user) => {
        if (err) { return done(err); }
        if (!user) {
            return done(null, false);
        }

        // Verify a given token
        const tokenValidates = speakeasy.totp.verify({
            secret: user.securityStamp.toString(),
            encoding: 'base32',
            token: password,
            window: 10  //window 10 for 5 mins expiration.
        });

        if (!tokenValidates) {
            return done(null, false, {
                message: "Your login details could not be verified. Please try again.",
            });
        }
        
        return done(null, user);
    });
});
// Setting JWT strategy options
const jwtOptions: StrategyOptions = {
    // Telling Passport to check BearerToken/query/body for JWT
    jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeaderAsBearerToken(), ExtractJwt.fromUrlQueryParameter('token'), ExtractJwt.fromBodyField('token')]),
    // Telling Passport where to find the secret
    secretOrKey: config.jwtSecret
    // TO-DO: Add issuer and audience checks
};

// Setting up JWT login strategy
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {

    UserModel.findOne({ username: payload.username }).then(user => {
        done(null, user);
    }).catch(error => {
        done(null, false);
    });
});

const anonymousLogin = new AnonymousStrategy();

const localWxOptions = {
    usernameField: 'code',
    passwordField: 'code',
};
const localWxLogin = new LocalStrategy(localWxOptions, async (username, password, done) => {

    if (!username) {
        return done(null, false, {
            message: "Your login details could not be verified. Please try again."
        });
    }

    let accessToken = await getAccessTokenAsync(username).catch(error => {
        console.error(error);
        return null;
    });
    if (!accessToken) {
        //todo: accessToken null.
        return done(null, false);
    }

    const { openid, access_token, refresh_token } = accessToken;

    if (!openid) {
        return done(null, false);
    }

    let user = await getWxUserInfoAsync(access_token, openid).catch(error => {
        console.error(error);
        return null;
    });

    if (user && user.wxOpenId) {
        return done(null, user);
    }

    return done(null, false);
});

async function getAccessTokenAsync(code: string): Promise<any> {
    // Step1: Get access_token & openId.
    const accessTokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.wx.appId}&secret=${config.wx.appSecret}&code=${code}&grant_type=authorization_code`;
    console.log(accessTokenUrl);

    return new Promise((resolve, reject) => {
        const request = https.request({
            hostname: "api.weixin.qq.com",
            port: 443,
            path: `/sns/oauth2/access_token?appid=${config.wx.appId}&secret=${config.wx.appSecret}&code=${code}&grant_type=authorization_code`,
            method: "GET",
        }, (wxRes) => {
            console.log("access_token response from wx api.");
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

        request.end();
    });
}

async function getWxUserInfoAsync(accessToken, openId) {
    // todo: Step2. Get user info
    const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openId}&lang=zh_CN`;
    console.log(userInfoUrl);
    return new Promise((resolve, reject) => {
        const request = https.request({
            hostname: "api.weixin.qq.com",
            port: 443,
            path: `/sns/userinfo?access_token=${accessToken}&openid=${openId}&lang=zh_CN`,
            method: "GET",
        }, (wxRes) => {
            console.log("userinfo response from wx api.");

            let data = "";
            wxRes.on("data", (chunk) => {
                data += chunk;
            });

            wxRes.on("end", () => {
                console.log(data);
                let result = JSON.parse(data);

                let { openid, unionid, nickname, sex, province, city, country, headimgurl } = result;
                if (!openid) {
                    return reject(result);
                }
                else {
                    let user = {
                        wxOpenId: openid,
                        unionId: unionid,
                        nickName: nickname,
                        gender: sex,
                        province: province,
                        city: city,
                        country: country,
                        avatarUrl: headimgurl,
                    };

                    return resolve(user);
                }
            });
        });
        request.end();
    });
}

// Setting JWT strategy options
const jwtServiceOptions = {
    // Telling Passport to check authorization headers for JWT
    jwtFromRequest: ExtractJwt.fromUrlQueryParameter("token"),
    // Telling Passport where to find the secret
    secretOrKey: config.service.jwtSecret
    // TO-DO: Add issuer and audience checks
};

const jwtServiceLogin = new JwtStrategy(jwtServiceOptions, (payload, done) => {
    console.log("jwt service payload ", payload);
    if (!payload.service || payload.peerName != config.service.name) {
        return done(null, false);
    }

    return done(null, {
        service: payload.service,
    });
});

(passport as any).default.serializeUser(function (user, done) {
    done(null, user);
});

(passport as any).default.deserializeUser(function (user, done) {
    done(null, user);
});

(passport as any).default.use("jwt", jwtLogin);
(passport as any).default.use("local", localLogin);
(passport as any).default.use("anonymous", anonymousLogin);
(passport as any).default.use("localWx", localWxLogin);
(passport as any).default.use("jwtService", jwtServiceLogin);

export default passport;