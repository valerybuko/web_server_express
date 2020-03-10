import express, { Router } from 'express';
import { IBaseController, IAccountController, IUserController } from '../Domain';
import { injectable, inject } from 'inversify';
import types from '../Ioc/types';
import IAdminController from "../Domain/Interfaces/IAdminController";

@injectable()
export default class BaseController implements IBaseController {
    private readonly accountController: IAccountController
    private readonly userController: IUserController
    private readonly adminController: IAdminController
    router: Router

    private initializeRoutes() {
        this.router.use('/', this.accountController.router);
        this.router.use('/', this.userController.router);
        this.router.use('/', this.adminController.router);
    }

    constructor(@inject(types.AccountController) accountController: IAccountController,
                @inject(types.UserController) userController: IUserController,
                @inject(types.AdminController) adminController: IAdminController) {
        this.router = express.Router();
        this.accountController = accountController;
        this.userController = userController;
        this.adminController = adminController;
        this.initializeRoutes()
    }
}
