import { Router } from 'express';
import ReqResModel from "../Models/ReqResModel";

export default interface IAccountController {
  router: Router;
  initializeRoutes (): Router;
  changeUserRole (model: ReqResModel): Promise<void>;
}
