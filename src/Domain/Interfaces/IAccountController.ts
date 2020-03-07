import { Router } from 'express';
import QueryModel from "../Models/QueryModel";

export default interface IAccountController {
  router: Router;
  checkValidation (): any;
  checkEmailBeforePasswordReset (): any;
  checkPasswordBeforeUpdate (): any;
  initializeRoutes (): any;
  createAccount (model: QueryModel): any;
  confirmAccount (model: QueryModel): any;
  loginAccount (model: QueryModel): any;
  logoutAccount (model: QueryModel): any;
  changePasswordAccount (model: QueryModel): any;
  updatePasswordAccount (model: QueryModel): any;
  refreshTokensAccount (model: QueryModel): any;
}
