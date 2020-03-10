import { Router, Request, Response } from 'express';

export default interface IUserController {
  router: Router;
  getUsers (req: Request, res: Response): Promise<any>;
  getUser (req: Request, res: Response): Promise<any>;
  getEmail (req: Request, res: Response): Promise<any>;
  updateUser (req: Request, res: Response): Promise<any>;
  deleteUser (req: Request, res: Response): Promise<void>;
}
