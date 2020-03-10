import { Router, Request, Response } from 'express';
import LoginTokensModel from "../Models/LoginTokensModel";
import ReqResModel from "../Models/ReqResModel";

export default interface IAccountController {
  router: Router;
  createAccount (req: Request, res: Response): Promise<any>;
  confirmAccount (req: Request, res: Response): Promise<any>;
  loginAccount (req: Request, res: Response): Promise<any>;
  logoutAccount (req: Request, res: Response): Promise<void>;
  changePasswordAccount (req: Request, res: Response): Promise<any>;
  updatePasswordAccount (req: Request, res: Response): Promise<any>;
  refreshTokensAccount (req: Request, res: Response): Promise<any>;
}
