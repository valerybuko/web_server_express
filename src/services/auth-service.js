import UsersSessions from "../sequelize/UsersSessionsModel";
import jwt from 'jsonwebtoken';
import redis from "../dal/redis";
import VerificationTokens from "../sequelize/VerificationTokensModel";

export const REFRESH_TOKEN_SECRET = 'abc123';

export const generateJWT = (user, tokentimelife) => {
    const tokenData = {username: user.username, id: user.id};
    return jwt.sign({user: tokenData}, REFRESH_TOKEN_SECRET, {expiresIn: tokentimelife});
}

export const generateVerificationToken = (user, tokentimelife) => {
    const tokenData = {username: user.username, id: user.id};
    return jwt.sign({user: tokenData}, REFRESH_TOKEN_SECRET, {expiresIn: tokentimelife});
}

export const createRefreshToken = async (user, tokentimelife) => {
    const token = await generateJWT(user, tokentimelife);
    return UsersSessions.create({tokenname: token, userId: user.id});
}

export const updateRefreshToken = async (user, refToken) => {
    const token = await generateJWT(user, '1d');
    await UsersSessions.update({ tokenname: token, userId: user.id }, {
        where: {
            tokenname: refToken
        }
    })
    return token;
}

export const getRefreshToken = async (token) => {
    const refreshToken = await UsersSessions.findOne({
        where: {
            tokenname: token
        }
    });
    return refreshToken;
}

export const getVerificationToken = async (token) => {
    const verificationToken = await VerificationTokens.findOne({
        where: {
            tokenname: token
        }
    });
    return verificationToken;
}

const recodeHashToRedis = async (redis, user, token) => {
    redis.lpush(user.id, token);
}

export const createAccessToken = async (user, tokentimelife) => {
    const token = await generateJWT(user, tokentimelife);
    await recodeHashToRedis(redis, user, token);
    return token;
}

export const updateAccessToken = async (user, oldToken, tokentimelife) => {
    const deletedToken = await redis.lrem(`${user.id}`, 0, oldToken);
    if(!deletedToken) {
        return res.status(400).send();
    }
    const token = await generateJWT(user, tokentimelife);
    await redis.lpush(user.id, token);
    return token;
}

export const verifyToken = (token, REFRESH_TOKEN_SECRET) => jwt.verify(token, REFRESH_TOKEN_SECRET, (err) => {
    if (err) {
        return res.status(403).send();
    } else {
        return true
    }
});
