import * as passport from 'passport';
import User from '../models/user.model';
import { Strategy as JwtStrategy, StrategyOptions } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as AnonymousStrategy } from 'passport-anonymous';

import speakeasy from 'speakeasy';

import config from './config';
import UserModel from '../models/user.model';
// Setting username field to phoneNo rather than username
const localOptions = {
    usernameField: 'username',
    passwordField: 'verificationCode',
};

// Setting up local login strategy
const localLogin = new LocalStrategy(localOptions, (username, password, done) => {
    console.log("localLogin");
    User.findOne({ username: username }, (err, user) => {
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
                message: "Your login details could not be verified. Please try again."
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

(passport as any).default.serializeUser(function (user, done) {
    done(null, user);
});

(passport as any).default.deserializeUser(function (user, done) {
    done(null, user);
});

(passport as any).default.use("jwt", jwtLogin);
(passport as any).default.use("local", localLogin);
(passport as any).default.use("anonymous", anonymousLogin);

export default passport;