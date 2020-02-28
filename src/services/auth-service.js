import UsersSessions from "../sequelize/UsersSessionsModel";
import jwt from 'jsonwebtoken';
import redisClient from "../dal/redis";
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

const recodeHashToRedis = async (redisClient, user, index, token) => {
    await redisClient.zadd(`user${user.id}`, `${index}`, token);
}

export const saveSessionToRedis = async (user, tokentimelife, index) => {
    const token = await generateJWT(user, tokentimelife);
    await recodeHashToRedis(redisClient, user, index, token);
    return token;
}

export const checkCorrectAccessToken = async (userId, token) => {
    const tokenFromCLientSide = token;
    const array = [];
    const zrange = (id, start, end) => new Promise((resolve, reject) => {
        redisClient.zrange(id, start, end, (err, value) => {
            if (err) {
                reject(err);
            } else {
                resolve(value);
            }

        });
    });
    const tokensArray = await zrange(`user${userId}`, 0, -1);
    console.log('Array result', tokensArray);
    if (!tokensArray.includes(tokenFromCLientSide)) {
        return false
    } else {
        return true
    }
}

export const updateAccessToken = async (user, oldToken, tokentimelife) => {
    const deletedToken = await redisClient.zrem(`user${user.id}`, oldToken);
    if(!deletedToken) {
        return false
    }
    const token = await generateJWT(user, tokentimelife);
    await recodeHashToRedis(redisClient, user, user.id, token);
    return token;
}

export const verifyToken = (token, REFRESH_TOKEN_SECRET) => jwt.verify(token, REFRESH_TOKEN_SECRET, (err) => {
    if (err) {
        return err
    } else {
        return true
    }
});
