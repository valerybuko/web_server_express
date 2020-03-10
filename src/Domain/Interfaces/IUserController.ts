import { Router, Request, Response } from 'express';
import ReqResModel from "../Models/ReqResModel";
import UserEntity from "../Entities/UserEntity";

export default interface IUserController {
  router: Router;
  checkValidation (): Array<string | undefined>;
  checkEmail (): Array<string | undefined>;
  initializeRoutes (): Router;
  getUsers (model: ReqResModel): Promise<any>;
  getUser (model: ReqResModel): Promise<any>;
  getEmail (model: ReqResModel): Promise<any>;
  updateUser (model: ReqResModel): Promise<any>;
  deleteUser (model: ReqResModel): Promise<void>;
}
