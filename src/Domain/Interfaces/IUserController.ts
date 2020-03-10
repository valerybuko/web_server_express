import { Router, Request, Response } from 'express';
import ReqResModel from "../Models/ReqResModel";

export default interface IUserController {
  router: Router;
  checkValidation (): Array<string | undefined>;
  checkEmail (): Array<string | undefined>;
  initializeRoutes (): Router;
  getUsers (model: ReqResModel): Array<object> | Array<undefined>;
  getUser (model: ReqResModel): object | null | undefined;
  getEmail (model: ReqResModel): object | null | undefined;
  updateUser (model: ReqResModel): Promise<void>;
  deleteUser (model: ReqResModel): number;
}
