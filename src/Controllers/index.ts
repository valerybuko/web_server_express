import express, { Router } from 'express';
import AccountController from "./AccountController";
import UserController from "./UserController";
import AdminController from "./AdminController";

export default class BaseController {
    private readonly accountController: any
    private readonly userController: any
    private readonly adminController: any
    router: Router

    constructor() {
        this.router = express.Router();
        this.accountController = new AccountController();
        this.userController = new UserController();
        this.adminController = new AdminController();
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.use('/', this.accountController.router);
        this.router.use('/', this.userController.router);
        this.router.use('/', this.adminController.router);
    }
}
