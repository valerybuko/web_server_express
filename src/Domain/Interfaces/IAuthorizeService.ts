export default interface IAuthorizeService {
  REFRESH_TOKEN_SECRET: string;
  redisRepository: any;
  generateJWT (user: any, tokentimelife: string): any;
  generateConfirmationToken (user: any, tokentimelife: string): any;
  deleteConfirmationToken (token: string): any
  deleteChangePasswordToken(token: string): any;
  createRefreshToken (user: any, tokentimelife: string): any;
  updateRefreshToken (user: any, refToken: string): any;
  createConfirmationToken (user: any, tokentimelife: string): any;
  createChangePasswordToken (user: any, tokentimelife: string): any;
  getRefreshToken (token: string): any;
  getConfirmationToken (token: string): any;
  getChangePasswordToken (token: string): any;
  saveSessionToRedis (user: any, tokentimelife: string, index: number): any;
  updateAccessToken (sessionID: number ,user: any, tokentimelife: string): any;
  verifyToken (token: string, REFRESH_TOKEN_SECRET: string): any;
  deleteSession (id: number): any;
  getSessionData (id: number): any
}
