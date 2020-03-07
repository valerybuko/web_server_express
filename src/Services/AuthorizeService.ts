import UsersSessions from "../Dal/MySql/Models/UsersSessionsModel";
import jwt from 'jsonwebtoken';
import redisClient from "../Dal/Redis";
import ConfirmationTokens from "../Dal/MySql/Models/ConfirmationTokensModel";
import ChangePasswordTokens from "../Dal/MySql/Models/ChangePasswordTokensModel";
import RedisRepository from "../Dal/Redis/repository";
import {injectable} from "inversify";

@injectable()
export default class AuthorizeService {
    REFRESH_TOKEN_SECRET: string = 'abc123'
    redisRepository: any

    constructor() {
        this.redisRepository = new RedisRepository();
    }

    generateJWT = (user: any, tokentimelife: string) => {
        const tokenData = {username: user.username, id: user.id};
        return jwt.sign({user: tokenData}, this.REFRESH_TOKEN_SECRET, {expiresIn: tokentimelife});
    }

    generateConfirmationToken = (user: any, tokentimelife: string) => {
        const confirmationToken = this.generateJWT(user, tokentimelife);
        console.log(jwt.decode(confirmationToken));

        return confirmationToken;
    }

    deleteConfirmationToken = (token: string) => {
        return ConfirmationTokens.destroy({
            where: {
                tokenname: token
            }
        })
    }

    deleteChangePasswordToken = (token: string) => {
        return ChangePasswordTokens.destroy({
            where: {
                tokenname: token
            }
        })
    }

    createRefreshToken = async (user: any, tokentimelife: string) => {
        const token = await this.generateJWT(user, tokentimelife);
        return UsersSessions.create({tokenname: token, userId: user.id});
    }

    updateRefreshToken = async (user: any, refToken: string) => {
        const token = await this.generateJWT(user, `${process.env.JWT_REFRESH_LIFETIME}`);

        await UsersSessions.update({ tokenname: token, userId: user.id }, {
            where: {
                tokenname: refToken
            }
        });

        return token;
    }

    createConfirmationToken = async (user: any, tokentimelife: string) => {
        const token = await this.generateConfirmationToken(user, tokentimelife);
        return ConfirmationTokens.create({ tokenname: token, userId: user.id});
    }

    createChangePasswordToken = async (user: any, tokentimelife: string) => {
        const token = await this.generateConfirmationToken(user, tokentimelife);
        return  ChangePasswordTokens.create({ tokenname: token, userId: user.id });
    }

    getRefreshToken = async (token: string) => {
        const refreshToken = await UsersSessions.findOne({
            where: {
                tokenname: token
            }
        });
        return refreshToken;
    }

    getConfirmationToken = async (token: string) => {
        const confirmationToken = await ConfirmationTokens.findOne({
            where: {
                tokenname: token
            }
        });
        return confirmationToken;
    }

    getChangePasswordToken = async (token: string) => {
        const changePasswordToken = await ChangePasswordTokens.findOne({
            where: {
                tokenname: token
            }
        });
        return changePasswordToken;
    }

    saveSessionToRedis = async (user: any, tokentimelife: string, index: number) => {
        const token = await this.generateJWT(user, tokentimelife);
        await this.redisRepository.recodeHashToRedis(redisClient, user, index, token);
        return token;
    }

    updateAccessToken = async (sessionID: number ,user: any, tokentimelife: string) => {
        await this.redisRepository.deleteSession(`user${sessionID}`);
        const token = await this.generateJWT(user, tokentimelife);
        await this.redisRepository.recodeHashToRedis(redisClient, user, user.id, token);
        return token;
    }

    deleteSession = async (id: number) => {
        await this.redisRepository.deleteSession(`user${id}`);
    }

    verifyToken = (token :string, REFRESH_TOKEN_SECRET: string): any => jwt.verify(token, this.REFRESH_TOKEN_SECRET, (err) => {
        if (err) {
            return err
        } else {
            return true
        }
    });


    getSessionData = async (id: number) => {
        const sessionData = await UsersSessions.findOne({
            where: {
                userId: id
            }
        });
        return sessionData;
    }
}
