import { Router } from 'express';
import QueryModel from "../Models/QueryModel";

export default interface IUserController {
  router: Router;
  checkValidation (): any;
  checkEmail (): any;
  initializeRoutes (): any;
  getUsers (model: QueryModel): any;
  getUser (model: QueryModel): any;
  getEmail (model: QueryModel): any;
  updateUser (model: QueryModel): any;
  deleteUser (model: QueryModel): any;
}
