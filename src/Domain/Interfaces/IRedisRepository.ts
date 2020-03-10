import UserModel from "../Models/UserModel";

export default interface IRedisRepository {
  recodeHashToRedis (redisClient: any, user: UserModel, index: number, token: string): Promise<void>;
  checkCorrectAccessToken (userId: number, token: string): Promise<object | boolean>;
  deleteSession (sessionID: number | string): Promise<any>;
}
