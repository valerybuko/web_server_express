import express, { Router } from 'express';
import UserController from "./UserController";
import AdminController from "./AdminController";
import { IBaseController, IAccountController } from '../Domain';
import { injectable, inject } from 'inversify';
import types from '../Ioc/types';
import AccountController from './AccountController';

@injectable()
export default class BaseController implements IBaseController {
    private readonly accountController: IAccountController
    private readonly userController: any
    private readonly adminController: any
    router: Router

    constructor(@inject(types.AccountController) accountController: IAccountController, @inject(types.UserController) userController: UserController) {
        this.router = express.Router();
        this.accountController = accountController;
        this.userController = userController;
        this.adminController = new AdminController();
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.use('/', this.accountController.router);
        this.router.use('/', this.userController.router);
        this.router.use('/', this.adminController.router);
    }
}
