import UserModel from "../Models/UserModel";
import UsersSessionsEntity from "../Entities/UsersSessionsEntity";
import ConfirmationTokenEntity from "../Entities/ConfirmationTokenEntity";
import PasswordTokenEntity from "../Entities/PasswordTokenEntity";

export default interface IAuthorizeService {
  REFRESH_TOKEN_SECRET: string;
  redisRepository: any;
  generateJWT (user: any, tokentimelife: string): string;
  generateConfirmationToken (user: UserModel, tokentimelife: string): string;
  deleteConfirmationToken (token: string): Promise<number>
  deleteChangePasswordToken(token: string): Promise<number>;
  createRefreshToken (user: UserModel, tokentimelife: string): Promise<UsersSessionsEntity>;
  updateRefreshToken (user: UserModel, refToken: string): Promise<string>;
  createConfirmationToken (user: UserModel, tokentimelife: string): Promise<ConfirmationTokenEntity>;
  createChangePasswordToken (user: UserModel, tokentimelife: string): Promise<PasswordTokenEntity>;
  getRefreshToken (token: string): Promise<UsersSessionsEntity>;
  getConfirmationToken (token: string): Promise<ConfirmationTokenEntity>;
  getChangePasswordToken (token: string): Promise<PasswordTokenEntity>;
  saveSessionToRedis (user: UserModel, tokentimelife: string, index: number): Promise<string>;
  updateAccessToken (sessionID: number ,user: any, tokentimelife: string): Promise<string>;
  verifyToken (token: string, REFRESH_TOKEN_SECRET: string): Promise<any>;
  deleteSession (id: number): Promise<void>;
  getSessionData (id: number): Promise<UsersSessionsEntity>
}
