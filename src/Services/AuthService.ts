import UsersSessions from "../Dal/MySql/Models/UsersSessionsModel";
import jwt from 'jsonwebtoken';
import redisClient from "../Dal/Redis";
import ConfirmationTokens from "../Dal/MySql/Models/ConfirmationTokensModel";
import ChangePasswordTokens from "../Dal/MySql/Models/ChangePasswordTokensModel";
import RedisRepository from "../Dal/Redis/repository";


export default class AuthorizeService {
    REFRESH_TOKEN_SECRET = 'abc123'

    constructor() {
        this.redisRepository = new RedisRepository();
    }

    generateJWT = (user, tokentimelife) => {
        const tokenData = {username: user.username, id: user.id};
        return jwt.sign({user: tokenData}, this.REFRESH_TOKEN_SECRET, {expiresIn: tokentimelife});
    }

    generateConfirmationToken = (user, tokentimelife) => {
        const confirmationToken = this.generateJWT(user, tokentimelife);
        console.log(jwt.decode(confirmationToken));

        return confirmationToken;
    }

    deleteConfirmationToken = (token) => {
        return ConfirmationTokens.destroy({
            where: {
                tokenname: token
            }
        })
    }

    deleteChangePasswordToken = (token) => {
        return ChangePasswordTokens.destroy({
            where: {
                tokenname: token
            }
        })
    }

    createRefreshToken = async (user, tokentimelife) => {
        const token = await this.generateJWT(user, tokentimelife);
        return UsersSessions.create({tokenname: token, userId: user.id});
    }

    updateRefreshToken = async (user, refToken) => {
        const token = await this.generateJWT(user, `${process.env.JWT_REFRESH_LIFETIME}`);

        await UsersSessions.update({ tokenname: token, userId: user.id }, {
            where: {
                tokenname: refToken
            }
        });

        return token;
    }

    createConfirmationToken = async (user, tokentimelife) => {
        const token = await this.generateConfirmationToken(user, tokentimelife);
        return ConfirmationTokens.create({ tokenname: token, userId: user.id});
    }

    createChangePasswordToken = async (user, tokentimelife) => {
        const token = await this.generateConfirmationToken(user, tokentimelife);
        return  ChangePasswordTokens.create({ tokenname: token, userId: user.id });
    }

    getRefreshToken = async (token) => {
        const refreshToken = await UsersSessions.findOne({
            where: {
                tokenname: token
            }
        });
        return refreshToken;
    }

    getConfirmationToken = async (token) => {
        const confirmationToken = await ConfirmationTokens.findOne({
            where: {
                tokenname: token
            }
        });
        return confirmationToken;
    }

    getChangePasswordToken = async (token) => {
        const changePasswordToken = await ChangePasswordTokens.findOne({
            where: {
                tokenname: token
            }
        });
        return changePasswordToken;
    }

    saveSessionToRedis = async (user, tokentimelife, index) => {
        const token = await this.generateJWT(user, tokentimelife);
        await this.redisRepository.recodeHashToRedis(redisClient, user, index, token);
        return token;
    }

    updateAccessToken = async (sessionID ,user, tokentimelife) => {
        await this.redisRepository.deleteSession(`user${sessionID}`);
        const token = await this.generateJWT(user, tokentimelife);
        await this.redisRepository.recodeHashToRedis(redisClient, user, user.id, token);
        return token;
    }

    verifyToken = (token, REFRESH_TOKEN_SECRET) => jwt.verify(token, this.REFRESH_TOKEN_SECRET, (err) => {
        if (err) {
            return err
        } else {
            return true
        }
    });


    getSessionData = async (id) => {
        const sessionData = await UsersSessions.findOne({
            where: {
                userId: id
            }
        });
        return sessionData;
    }
}
