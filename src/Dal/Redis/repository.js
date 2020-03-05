import redisClient from "./index";

export default class RedisRepository {
    constructor() {
    }

    recodeHashToRedis = async (redisClient, user, index, token) => {
        await redisClient.zadd(`user${user.id}`, `${index}`, token);
        redisClient.expire(`user${user.id}`, process.env.JWT_ACCESS_LIFETIME);
    }

    checkCorrectAccessToken = async (userId, token) => {
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

        if (!tokensArray.includes(token)) {
            return false
        } else {
            return true
        }
    }

    deleteSession = async (sessionID) => {
        await redisClient.del(sessionID);
    }
}