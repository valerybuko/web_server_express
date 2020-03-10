import { Router } from 'express';
import LoginTokensModel from "../Models/LoginTokensModel";
import ReqResModel from "../Models/ReqResModel";

export default interface IAccountController {
  router: Router;
  checkValidation (): Array<string | undefined>;
  checkEmailBeforePasswordReset (): Array<string | undefined>;
  checkPasswordBeforeUpdate (): Array<string | undefined>;
  initializeRoutes (): Router;
  createAccount (model: ReqResModel): Promise<void>;
  confirmAccount (model: ReqResModel): void;
  loginAccount (model: ReqResModel): LoginTokensModel;
  logoutAccount (model: ReqResModel): Promise<void>;
  changePasswordAccount (model: ReqResModel): Promise<void>;
  updatePasswordAccount (model: ReqResModel): Promise<void>;
  refreshTokensAccount (model: ReqResModel): LoginTokensModel;
}
