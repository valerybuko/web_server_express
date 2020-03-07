import { Container } from 'inversify';
import 'reflect-metadata';
import TYPES from './types';
import {
  IBaseController,
  IMailerService,
  IAccountController,
  IAuthorizeService,
  IUserController,
  IUserService,
  IPasswordService,
  IAdminController,
} from '../Domain';
import BaseController from '../Controllers';
import MailerService from '../Services/MailerService';
import AccountController from '../Controllers/AccountController';
import AuthorizeService from "../Services/AuthorizeService";
import UserController from "../Controllers/UserController";
import UserService from "../Services/UserService";
import PasswordService from "../Services/PasswordService";
import AdminController from "../Controllers/AdminController";

const Ioc = new Container();

Ioc.bind<IBaseController>(TYPES.BaseController).to(BaseController)
Ioc.bind<IMailerService>(TYPES.MailerService).to(MailerService)
Ioc.bind<IAccountController>(TYPES.AccountController).to(AccountController)
Ioc.bind<IAuthorizeService>(TYPES.AuthorizeService).to(AuthorizeService)
Ioc.bind<IUserController>(TYPES.UserController).to(UserController);
Ioc.bind<IUserService>(TYPES.UserService).to(UserService);
Ioc.bind<IPasswordService>(TYPES.PasswordService).to(PasswordService);
Ioc.bind<IAdminController>(TYPES.AdminController).to(AdminController);


export default Ioc