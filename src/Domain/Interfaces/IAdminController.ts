import { Router } from 'express';
import QueryModel from "../Models/QueryModel";

export default interface IAccountController {
  router: Router;
  initializeRoutes (): any;
  changeUserRole (model: QueryModel): any;
}
