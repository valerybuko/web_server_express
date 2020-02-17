import UsersSessions from "../sequelize/UsersSessionsModel";
import jwt from 'jsonwebtoken';
import redis from "../dal/redis";
import ConfirmationTokens from "../sequelize/ConfirmationTokensModel";
import ChangePasswordTokens from "../sequelize/ChangePasswordTokensModel";

export const REFRESH_TOKEN_SECRET = 'abc123';

export const generateJWT = (user, tokentimelife) => {
    const tokenData = {username: user.username, id: user.id};
    return jwt.sign({user: tokenData}, REFRESH_TOKEN_SECRET, {expiresIn: tokentimelife});
}

export const generateConfirmationToken = (user, tokentimelife) => {
    const tokenData = {username: user.username, id: user.id};
    return jwt.sign({user: tokenData}, REFRESH_TOKEN_SECRET, {expiresIn: tokentimelife});
}

export const deleteConfirmationToken = (token) => {
    return ConfirmationTokens.destroy({
        where: {
            tokenname: token
        }
    })
}

export const deleteChangePasswordToken = (token) => {
    return ChangePasswordTokens.destroy({
        where: {
            tokenname: token
        }
    })
}

export const createRefreshToken = async (user, tokentimelife) => {
    const token = await generateJWT(user, tokentimelife);
    return UsersSessions.create({tokenname: token, userId: user.id});
}

export const updateRefreshToken = async (user, refToken) => {
    const token = await generateJWT(user, `${process.env.JWT_REFRESH_LIFETIME}`);

    await UsersSessions.update({ tokenname: token, userId: user.id }, {
        where: {
            tokenname: refToken
        }
    });

    return token;
}

export const createConfirmationToken = async (user, tokentimelife) => {
    const token = await generateConfirmationToken(user, tokentimelife);
    return ConfirmationTokens.create({ tokenname: token, userId: user.id});
}

export const createChangePasswordToken = async (user, tokentimelife) => {
    const token = await generateConfirmationToken(user, tokentimelife);
    return  ChangePasswordTokens.create({ tokenname: token, userId: user.id });
}

export const getRefreshToken = async (token) => {
    const refreshToken = await UsersSessions.findOne({
        where: {
            tokenname: token
        }
    });
    return refreshToken;
}

export const getConfirmationToken = async (token) => {
    const confirmationToken = await ConfirmationTokens.findOne({
        where: {
            tokenname: token
        }
    });
    return confirmationToken;
}

export const getChangePasswordToken = async (token) => {
    const changePasswordToken = await ChangePasswordTokens.findOne({
        where: {
            tokenname: token
        }
    });
    return changePasswordToken;
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
        return false
    }
    const token = await generateJWT(user, tokentimelife);
    await redis.lpush(user.id, token);
    return token;
}

export const verifyToken = (token, REFRESH_TOKEN_SECRET) => jwt.verify(token, REFRESH_TOKEN_SECRET, (err) => {
    if (err) {
        return err
    } else {
        return true
    }
});
