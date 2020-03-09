import { Router, Request, Response } from 'express';

export default interface IAccountController {
  router: Router;
  checkValidation (): any;
  checkEmailBeforePasswordReset (): any;
  checkPasswordBeforeUpdate (): any;
  initializeRoutes (): any;
  createAccount (req: Request, res: Response): any;
  confirmAccount (req: Request, res: Response): any;
  loginAccount (req: Request, res: Response): any;
  logoutAccount (req: Request, res: Response): any;
  changePasswordAccount (req: Request, res: Response): any;
  updatePasswordAccount (req: Request, res: Response): any;
  refreshTokensAccount (req: Request, res: Response): any;
}
