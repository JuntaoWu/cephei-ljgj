import UserModel, { User } from '../models/user.model';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import appRoot from 'app-root-path';
import * as path from 'path';

export let loadByUnionId = (unionId: string) => {
    return UserModel.findOne({ unionid: unionId });
};

/**
 * Load user and append to req.
 */
export let load = (req, res, next, id) => {
    UserModel.findById(id)
        .then((user) => {
            req.user = user; // eslint-disable-line no-param-reassign
            return next();
        })
        .catch((e) => next(e));
}

/**
 * Get user
 * @returns {User}
 */
export let get = (req, res) => {
    return res.json(req.user);
}

/**
 * Create new user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.mobileNumber - The mobileNumber of user.
 * @returns {User}
 */
export let create = (req, res, next) => {

    let uid = (100000 + Math.floor(Math.random() * 900000));
    let avatarUrl = req.body.headimgurl ? `/download/avatar/${uid}.jpg` : '';

    const user = new UserModel({
        unionid: req.body.unionid,
        headimgurl: req.body.headimgurl,
        openid: req.body.openid,
        sex: req.body.sex,
        username: req.body.nickname,
        nickname: req.body.nickname,
        uid: uid,
        avatarUrl: avatarUrl,
        parentProxyId: req.body.parentProxyId
    });

    return user.save()
        .then((savedUser) => {

            console.log("download avatar:", req.body.headimgurl);

            let client: any = /https/.test(req.body.headimgurl) ? https : http;

            let stream = fs.createWriteStream(path.join(appRoot.path, avatarUrl));

            const request = client.get(req.body.headimgurl, (downloadRes) => {
                downloadRes.pipe(stream);
            });

            return savedUser;
        })
        .catch(e => next(e));
}

/**
 * Update existing user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.mobileNumber - The mobileNumber of user.
 * @returns {User}
 */
export let update = (req, res, next) => {
    const user = req.user;
    user.username = req.body.username;
    user.mobileNumber = req.body.mobileNumber;

    user.save()
        .then((savedUser) => res.json(savedUser))
        .catch(e => next(e));
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
export let list = (req, res, next) => {
    const { limit = 50, skip = 0 } = req.query;
    UserModel.find().limit(limit).skip(skip)
        .then((users) => res.json(users))
        .catch((e) => next(e));
}

/**
 * Delete user.
 * @returns {User}
 */
export let remove = (req, res, next) => {
    const user = req.user;
    user.remove()
        .then((deletedUser) => res.json(deletedUser))
        .catch((e) => next(e));
};
