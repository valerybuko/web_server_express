import UsersSessions from "../Dal/MySql/Models/UsersSessionsModel";
import jwt from 'jsonwebtoken';
import redisClient from "../Dal/Redis";
import ConfirmationTokens from "../Dal/MySql/Models/ConfirmationTokensModel";
import ChangePasswordTokens from "../Dal/MySql/Models/ChangePasswordTokensModel";
import {inject, injectable} from "inversify";
import UserModel from "../Domain/Models/UserModel";
import types from "../Ioc/types";
import {IAuthorizeService, IRedisRepository} from "../Domain";
import UsersSessionsEntity from "../Domain/Entities/UsersSessionsEntity";
import ConfirmationTokenEntity from "../Domain/Entities/ConfirmationTokenEntity";
import PasswordTokenEntity from "../Domain/Entities/PasswordTokenEntity";


@injectable()
export default class AuthorizeService implements IAuthorizeService {
    REFRESH_TOKEN_SECRET: any;
    redisRepository: IRedisRepository;

    constructor(@inject(types.RedisRepository) redisRepository: IRedisRepository) {
        this.redisRepository = redisRepository;
        this.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
    }

    generateJWT = (user: UserModel, tokentimelife: string): string => {
        const tokenData = {username: user.username, id: user.id};
        return jwt.sign({user: tokenData}, this.REFRESH_TOKEN_SECRET, {expiresIn: tokentimelife});
    }

    generateConfirmationToken = (user: UserModel, tokentimelife: string): string => {
        const confirmationToken = this.generateJWT(user, tokentimelife);

        return confirmationToken;
    }

    deleteConfirmationToken = (token: string): Promise<number> => {
        return ConfirmationTokens.destroy({
            where: {
                tokenname: token
            }
        })
    }

    deleteChangePasswordToken = (token: string): Promise<number> => {
        return ChangePasswordTokens.destroy({
            where: {
                tokenname: token
            }
        })
    }

    createRefreshToken = async (user: UserModel, tokentimelife: string): Promise<UsersSessionsEntity> => {
        const token = await this.generateJWT(user, tokentimelife);
        return UsersSessions.create({tokenname: token, userId: user.id});
    }

    updateRefreshToken = async (user: UserModel, refToken: string): Promise<string> => {
        const token = await this.generateJWT(user, `${process.env.JWT_REFRESH_LIFETIME}`);

        await UsersSessions.update({tokenname: token, userId: user.id}, {
            where: {
                tokenname: refToken
            }
        });

        return token;
    }

    createConfirmationToken = async (user: UserModel, tokentimelife: string): Promise<ConfirmationTokenEntity> => {
        const token = await this.generateConfirmationToken(user, tokentimelife);
        return ConfirmationTokens.create({tokenname: token, userId: user.id});
    }

    createChangePasswordToken = async (user: UserModel, tokentimelife: string): Promise<PasswordTokenEntity> => {
        const token = await this.generateConfirmationToken(user, tokentimelife);
        return ChangePasswordTokens.create({tokenname: token, userId: user.id});
    }

    getRefreshToken = async (token: string): Promise<UsersSessionsEntity> => {
        const refreshToken = await UsersSessions.findOne({
            where: {
                tokenname: token
            }
        });
        return refreshToken;
    }

    getConfirmationToken = async (token: string): Promise<ConfirmationTokenEntity> => {
        const confirmationToken = await ConfirmationTokens.findOne({
            where: {
                tokenname: token
            }
        });
        return confirmationToken;
    }

    getChangePasswordToken = async (token: string): Promise<PasswordTokenEntity> => {
        const changePasswordToken = await ChangePasswordTokens.findOne({
            where: {
                tokenname: token
            }
        });
        return changePasswordToken;
    }

    saveSessionToRedis = async (user: UserModel, tokentimelife: string, index: number): Promise<string> => {
        const token = await this.generateJWT(user, tokentimelife);
        await this.redisRepository.recodeHashToRedis(redisClient, user, index, token);
        return token;
    }

    updateAccessToken = async (sessionID: number, user: any, tokentimelife: string): Promise<string> => {
        await this.redisRepository.deleteSession(`user${sessionID}`);
        const token = await this.generateJWT(user, tokentimelife);
        await this.redisRepository.recodeHashToRedis(redisClient, user, user.id, token);
        return token;
    }

    verifyToken = async (token: string, REFRESH_TOKEN_SECRET: string | undefined): Promise<boolean> => {
        const  isVerified = await jwt.verify(token, this.REFRESH_TOKEN_SECRET);
        return typeof isVerified === "object";
    };


    deleteSession = async (id: number): Promise<void> => {
        await this.redisRepository.deleteSession(`user${id}`);
    }

    getSessionData = async (id: number): Promise<UsersSessionsEntity> => {
        const sessionData = await UsersSessions.findOne({
            where: {
                userId: id
            }
        });
        return sessionData;
    }
}
