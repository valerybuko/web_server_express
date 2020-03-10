import { Router, Request, Response } from 'express';

export default interface IAccountController {
  router: Router;
  changeUserRole (req: Request, res: Response): Promise<any>;
}
