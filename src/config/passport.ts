import * as passport from 'passport';
import User from '../models/user.model';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';

import config from './config';
import UserModel from '../models/user.model';
// Setting username field to email rather than username
const localOptions = {
    usernameField: 'username',
    passwordField: 'password',
};

// Setting up local login strategy
const localLogin = new LocalStrategy(localOptions, (username, password, done) => {
    console.log("localLogin");
    User.findOne({ username: username }, (err, user) => {
        if (err) { return done(err); }
        if (!user) {
            return done(null, false);
        }

        if (user.password != password) {
            return done(null, false, {
                message: "Your login details could not be verified. Please try again."
            });
        }
        return done(null, user);
    });
});
// Setting JWT strategy options
const jwtOptions = {
    // Telling Passport to check authorization headers for JWT
    jwtFromRequest: ExtractJwt.fromUrlQueryParameter("token"),
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

(passport as any).default.serializeUser(function (user, done) {
    done(null, user);
});

(passport as any).default.deserializeUser(function (user, done) {
    done(null, user);
});

(passport as any).default.use("jwt", jwtLogin);
(passport as any).default.use("local", localLogin);

export default passport;