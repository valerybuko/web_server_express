import { Container } from 'inversify';
import 'reflect-metadata';
import TYPES from './types';
import {
  IBaseController,
  IMailerService,
  IAccountController,
} from '../Domain';
import BaseController from '../Controllers';
import MailerService from '../Services/MailerService';
import AccountController from '../Controllers/AccountController';

const Ioc = new Container()

Ioc.bind<IBaseController>(TYPES.BaseController).to(BaseController)
Ioc.bind<IMailerService>(TYPES.MailerService).to(MailerService)
Ioc.bind<IAccountController>(TYPES.AccountController).to(AccountController);


export default Ioc