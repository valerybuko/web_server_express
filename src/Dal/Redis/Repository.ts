import redisClient from "./index";
import UserModel from "../../Domain/Models/UserModel";
import {inject, injectable} from "inversify";
import {IRedisRepository} from "../../Domain";

@injectable()
export default class RedisRepository implements IRedisRepository{
    constructor() {
    }

    recodeHashToRedis = async (redisClient: any, user: UserModel, index: number, token: string): Promise<void> => {
        await redisClient.zadd(`user${user.id}`, `${index}`, token);
        redisClient.expire(`user${user.id}`, process.env.JWT_ACCESS_LIFETIME);
    }

    checkCorrectAccessToken = async (userId: number, token: string): Promise<object | boolean> => {
        const zrange = (id: string, start: number, end: number): Promise<any> => new Promise((resolve, reject) => {
            redisClient.zrange(id, start, end, (err: object, value: object | Array<string> | undefined) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(value);
                }
            });
        });
        const tokensArray: any = await zrange(`user${userId}`, 0, -1);

        if (!tokensArray.includes(token)) {
            return false
        } else {
            return true
        }
    }

    deleteSession = async (sessionID: string | number): Promise<any> => {
        await redisClient.del(sessionID);
    }
}
